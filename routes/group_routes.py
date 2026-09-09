from flask import Blueprint, request, jsonify
from backend.models.database import db, User, ResearchGroup, GroupMember
from backend.routes.auth_middleware import token_required

group_bp = Blueprint('groups', __name__, url_prefix='/api/groups')

@group_bp.route('', methods=['GET'])
@token_required
def list_groups(current_user):
    group_type_filter = request.args.get('type')
    query = ResearchGroup.query

    if group_type_filter:
        query = query.filter_by(group_type=group_type_filter.upper())

    groups = query.order_by(ResearchGroup.created_at.desc()).all()
    user_memberships = [m.group_id for m in GroupMember.query.filter_by(user_id=current_user.id).all()]
    
    results = []
    for g in groups:
        d = g.to_dict()
        d['is_member'] = (g.id in user_memberships)
        results.append(d)
        
    return jsonify({'groups': results}), 200

@group_bp.route('', methods=['POST'])
@token_required
def create_group(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()
    topic = data.get('topic', 'General Research').strip()
    group_type = data.get('group_type', 'STUDENT_ONLY').upper() # STUDENT_ONLY, FACULTY_STUDENT

    if not name or not description:
        return jsonify({'message': 'Group name and description are required'}), 400

    if group_type not in ['STUDENT_ONLY', 'FACULTY_STUDENT']:
        group_type = 'STUDENT_ONLY'

    if current_user.role == 'FACULTY' and group_type != 'FACULTY_STUDENT':
        return jsonify({'message': 'Faculty members can create Faculty-Student Joint Groups only.'}), 403
    if current_user.role == 'STUDENT' and group_type != 'STUDENT_ONLY':
        return jsonify({'message': 'Students can create Student-Only Groups only.'}), 403
    if current_user.role not in ['STUDENT', 'FACULTY']:
        return jsonify({'message': 'This account cannot create research groups.'}), 403

    group = ResearchGroup(
        name=name,
        description=description,
        topic=topic,
        group_type=group_type,
        creator_id=current_user.id
    )
    db.session.add(group)
    db.session.commit()

    member = GroupMember(group_id=group.id, user_id=current_user.id)
    db.session.add(member)
    db.session.commit()

    return jsonify({'message': 'Research group created successfully!', 'group': group.to_dict()}), 201

@group_bp.route('/<int:group_id>', methods=['GET'])
@token_required
def get_group(current_user, group_id):
    group = ResearchGroup.query.get(group_id)
    if not group:
        return jsonify({'message': 'Research group not found'}), 404

    data = group.to_dict()
    data['members'] = [m.to_dict() for m in group.members]
    user_member = GroupMember.query.filter_by(group_id=group_id, user_id=current_user.id).first()
    data['is_member'] = bool(user_member)

    return jsonify({'group': data}), 200

@group_bp.route('/<int:group_id>/join', methods=['POST'])
@token_required
def join_group(current_user, group_id):
    group = ResearchGroup.query.get(group_id)
    if not group:
        return jsonify({'message': 'Research group not found'}), 404

    if group.group_type == 'STUDENT_ONLY' and current_user.role == 'FACULTY':
        return jsonify({'message': 'This is a Student-Only collaboration group.'}), 403

    if group.group_type == 'FACULTY_STUDENT' and current_user.role == 'STUDENT':
        return jsonify({'message': 'A faculty member must invite you to this joint group.'}), 403

    existing = GroupMember.query.filter_by(group_id=group_id, user_id=current_user.id).first()
    if existing:
        return jsonify({'message': 'You are already a member of this group'}), 400

    member = GroupMember(group_id=group_id, user_id=current_user.id)
    db.session.add(member)
    db.session.commit()

    return jsonify({'message': f'Successfully joined {group.name}!', 'group': group.to_dict()}), 200

@group_bp.route('/<int:group_id>/invite', methods=['POST'])
@token_required
def invite_student(current_user, group_id):
    if current_user.role != 'FACULTY':
        return jsonify({'message': 'Only faculty members can invite students to joint groups.'}), 403

    group = ResearchGroup.query.get(group_id)
    if not group:
        return jsonify({'message': 'Research group not found'}), 404
    if group.group_type != 'FACULTY_STUDENT':
        return jsonify({'message': 'Students can only be invited to Faculty-Student Joint Groups.'}), 400
    if not GroupMember.query.filter_by(group_id=group_id, user_id=current_user.id).first():
        return jsonify({'message': 'You must belong to this group before inviting students.'}), 403

    data = request.get_json() or {}
    student_id = data.get('student_id')
    student = User.query.filter_by(id=student_id, role='STUDENT', is_active=True).first()
    if not student:
        return jsonify({'message': 'Active student not found'}), 404
    if GroupMember.query.filter_by(group_id=group_id, user_id=student.id).first():
        return jsonify({'message': 'This student is already a member of the group'}), 400

    db.session.add(GroupMember(group_id=group_id, user_id=student.id))
    db.session.commit()
    return jsonify({'message': 'Student invited to the group successfully', 'group': group.to_dict()}), 201

@group_bp.route('/<int:group_id>/leave', methods=['POST'])
@token_required
def leave_group(current_user, group_id):
    member = GroupMember.query.filter_by(group_id=group_id, user_id=current_user.id).first()
    if not member:
        return jsonify({'message': 'You are not a member of this group'}), 400

    db.session.delete(member)
    db.session.commit()

    return jsonify({'message': 'Successfully left the group'}), 200
