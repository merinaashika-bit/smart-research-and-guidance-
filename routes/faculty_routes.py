from flask import Blueprint, request, jsonify
from backend.models.database import db, User, FacultyProfile, StudentProfile, AdvisorRequest, Project, ResearchGroup, GroupMember
from backend.routes.auth_middleware import token_required

faculty_bp = Blueprint('faculty', __name__, url_prefix='/api/faculty')

@faculty_bp.route('/profile', methods=['GET'])
@token_required
def get_faculty_profile(current_user):
    profile = FacultyProfile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'message': 'Faculty profile not found'}), 404
    return jsonify({'profile': profile.to_dict()}), 200

@faculty_bp.route('/profile', methods=['PUT'])
@token_required
def update_faculty_profile(current_user):
    profile = FacultyProfile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        profile = FacultyProfile(user_id=current_user.id, full_name="Faculty Member")
        db.session.add(profile)

    data = request.get_json() or {}
    profile.full_name = data.get('full_name', profile.full_name)
    profile.department = data.get('department', profile.department)
    profile.designation = data.get('designation', profile.designation)
    profile.bio = data.get('bio', profile.bio)
    profile.expertise = data.get('expertise', profile.expertise)
    profile.interests = data.get('interests', profile.interests)
    profile.office_hours = data.get('office_hours', profile.office_hours)
    profile.available_for_advising = data.get('available_for_advising', profile.available_for_advising)

    db.session.commit()
    return jsonify({'message': 'Faculty profile updated successfully!', 'profile': profile.to_dict()}), 200

@faculty_bp.route('', methods=['GET'])
@token_required
def list_faculty(current_user):
    faculty_list = User.query.filter_by(role='FACULTY', is_active=True).all()
    results = []
    for f in faculty_list:
        prof = FacultyProfile.query.filter_by(user_id=f.id).first()
        if prof:
            results.append(prof.to_dict())
    return jsonify({'faculty': results}), 200

@faculty_bp.route('/accepted-advisors', methods=['GET'])
@token_required
def get_accepted_advisors(current_user):
    """Returns list of faculty advisors who have ACCEPTED an advisor request from current student."""
    accepted_requests = AdvisorRequest.query.filter_by(student_id=current_user.id, status='ACCEPTED').all()
    faculty_ids = [r.faculty_id for r in accepted_requests]

    results = []
    for fid in faculty_ids:
        prof = FacultyProfile.query.filter_by(user_id=fid).first()
        if prof:
            results.append(prof.to_dict())

    return jsonify({'accepted_advisors': results}), 200

@faculty_bp.route('/advisor-requests', methods=['GET'])
@token_required
def get_advisor_requests(current_user):
    if current_user.role == 'FACULTY':
        requests = AdvisorRequest.query.filter_by(faculty_id=current_user.id).order_by(AdvisorRequest.created_at.desc()).all()
    else:
        requests = AdvisorRequest.query.filter_by(student_id=current_user.id).order_by(AdvisorRequest.created_at.desc()).all()
    
    return jsonify({'requests': [r.to_dict() for r in requests]}), 200

@faculty_bp.route('/advisor-requests', methods=['POST'])
@token_required
def create_advisor_request(current_user):
    if current_user.role != 'STUDENT':
        return jsonify({'message': 'Only students can send advisor requests'}), 403

    data = request.get_json() or {}
    faculty_id = data.get('faculty_id')
    project_id = data.get('project_id')
    message = data.get('message', '')

    if not faculty_id:
        return jsonify({'message': 'Faculty ID is required'}), 400

    faculty_user = User.query.filter_by(id=faculty_id, role='FACULTY').first()
    if not faculty_user:
        return jsonify({'message': 'Faculty user not found'}), 404

    existing = AdvisorRequest.query.filter_by(student_id=current_user.id, faculty_id=faculty_id, status='PENDING').first()
    if existing:
        return jsonify({'message': 'You already have a pending request with this advisor.'}), 400

    req = AdvisorRequest(
        student_id=current_user.id,
        faculty_id=faculty_id,
        project_id=project_id,
        message=message,
        status='PENDING'
    )
    db.session.add(req)
    db.session.commit()

    return jsonify({'message': 'Advisor request sent successfully! Awaiting faculty acceptance.', 'request': req.to_dict()}), 201

@faculty_bp.route('/advisor-requests/<int:req_id>', methods=['PUT'])
@token_required
def respond_advisor_request(current_user, req_id):
    if current_user.role != 'FACULTY':
        return jsonify({'message': 'Only faculty can respond to advisor requests'}), 403

    req = AdvisorRequest.query.get(req_id)
    if not req or req.faculty_id != current_user.id:
        return jsonify({'message': 'Advisor request not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status', '').upper()

    if new_status not in ['ACCEPTED', 'REJECTED']:
        return jsonify({'message': 'Status must be ACCEPTED or REJECTED'}), 400

    req.status = new_status

    if new_status == 'ACCEPTED':
        # Update attached project if present
        if req.project_id:
            project = Project.query.get(req.project_id)
            if project:
                project.faculty_id = current_user.id
                if project.status == 'IDEA':
                    project.status = 'PROPOSED'

        # Auto-create a joint Faculty-Student Research Group if one does not already exist
        student_prof = StudentProfile.query.filter_by(user_id=req.student_id).first()
        faculty_prof = FacultyProfile.query.filter_by(user_id=req.faculty_id).first()
        student_name = student_prof.full_name if student_prof else "Student"
        faculty_name = faculty_prof.full_name if faculty_prof else "Faculty Advisor"

        group_name = f"{faculty_name} & {student_name} Joint Research Group"
        existing_group = ResearchGroup.query.filter_by(name=group_name).first()
        
        if not existing_group:
            joint_group = ResearchGroup(
                name=group_name,
                description=f"Joint faculty-student discussion group for {student_name} advised by {faculty_name}.",
                topic=faculty_prof.department if faculty_prof else "Academic Research",
                group_type="FACULTY_STUDENT",
                creator_id=current_user.id
            )
            db.session.add(joint_group)
            db.session.flush()

            gm1 = GroupMember(group_id=joint_group.id, user_id=req.faculty_id)
            gm2 = GroupMember(group_id=joint_group.id, user_id=req.student_id)
            db.session.add_all([gm1, gm2])

    db.session.commit()
    return jsonify({'message': f'Request {new_status.lower()} successfully!', 'request': req.to_dict()}), 200
