from flask import Blueprint, request, jsonify
from backend.models.database import db, User, StudentProfile, FacultyProfile, ResearchTopic, Project, ResearchGroup, Message
from backend.routes.auth_middleware import token_required, role_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/stats', methods=['GET'])
@token_required
@role_required(['ADMIN'])
def get_admin_stats(current_user):
    total_students = User.query.filter_by(role='STUDENT').count()
    total_faculty = User.query.filter_by(role='FACULTY').count()
    total_projects = Project.query.count()
    active_projects = Project.query.filter(Project.status.in_(['IN_PROGRESS', 'APPROVED'])).count()
    total_groups = ResearchGroup.query.count()
    total_topics = ResearchTopic.query.count()
    total_messages = Message.query.count()

    return jsonify({
        'total_students': total_students,
        'total_faculty': total_faculty,
        'total_projects': total_projects,
        'active_projects': active_projects,
        'total_groups': total_groups,
        'total_topics': total_topics,
        'total_messages': total_messages
    }), 200

@admin_bp.route('/users', methods=['GET'])
@token_required
@role_required(['ADMIN'])
def list_users(current_user):
    role_filter = request.args.get('role')
    query = User.query
    if role_filter:
        query = query.filter_by(role=role_filter.upper())
    
    users = query.order_by(User.created_at.desc()).all()
    results = []
    for u in users:
        d = u.to_dict()
        if u.role == 'STUDENT':
            sp = StudentProfile.query.filter_by(user_id=u.id).first()
            d['profile'] = sp.to_dict() if sp else None
        elif u.role == 'FACULTY':
            fp = FacultyProfile.query.filter_by(user_id=u.id).first()
            d['profile'] = fp.to_dict() if fp else None
        results.append(d)

    return jsonify({'users': results}), 200

@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@token_required
@role_required(['ADMIN'])
def toggle_user_status(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if user.id == current_user.id:
        return jsonify({'message': 'Cannot deactivate your own admin account!'}), 400

    data = request.get_json() or {}
    user.is_active = data.get('is_active', not user.is_active)
    db.session.commit()

    return jsonify({'message': f"User account {'activated' if user.is_active else 'deactivated'} successfully!", 'user': user.to_dict()}), 200

@admin_bp.route('/topics', methods=['GET', 'POST'])
@token_required
@role_required(['ADMIN'])
def manage_topics(current_user):
    if request.method == 'GET':
        topics = ResearchTopic.query.order_by(ResearchTopic.created_at.desc()).all()
        return jsonify({'topics': [t.to_dict() for t in topics]}), 200
    
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    domain = data.get('domain', '').strip()
    keywords = data.get('keywords', '').strip()
    description = data.get('description', '').strip()

    if not title or not domain or not description:
        return jsonify({'message': 'Title, domain, and description are required'}), 400

    topic = ResearchTopic(
        title=title,
        domain=domain,
        keywords=keywords,
        description=description,
        required_skills=data.get('required_skills', '')
    )
    db.session.add(topic)
    db.session.commit()

    return jsonify({'message': 'New research topic added successfully!', 'topic': topic.to_dict()}), 201

@admin_bp.route('/topics/<int:topic_id>', methods=['DELETE'])
@token_required
@role_required(['ADMIN'])
def delete_topic(current_user, topic_id):
    topic = ResearchTopic.query.get(topic_id)
    if not topic:
        return jsonify({'message': 'Research topic not found'}), 404

    db.session.delete(topic)
    db.session.commit()
    return jsonify({'message': 'Research topic deleted successfully'}), 200

@admin_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@token_required
@role_required(['ADMIN'])
def delete_project(current_user, project_id):
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted successfully'}), 200

@admin_bp.route('/groups/<int:group_id>', methods=['DELETE'])
@token_required
@role_required(['ADMIN'])
def delete_group(current_user, group_id):
    group = ResearchGroup.query.get(group_id)
    if not group:
        return jsonify({'message': 'Group not found'}), 404

    db.session.delete(group)
    db.session.commit()
    return jsonify({'message': 'Group deleted successfully'}), 200
