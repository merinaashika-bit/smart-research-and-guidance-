from flask import Blueprint, request, jsonify
from backend.models.database import db, User, Project, ProjectMember, ProjectReview, StudentProfile, FacultyProfile, AdvisorRequest
from backend.routes.auth_middleware import token_required

project_bp = Blueprint('projects', __name__, url_prefix='/api/projects')

@project_bp.route('', methods=['GET'])
@token_required
def list_projects(current_user):
    if current_user.role == 'FACULTY':
        projects = Project.query.filter((Project.faculty_id == current_user.id) | (Project.status.in_(['PROPOSED', 'UNDER_REVIEW']))).order_by(Project.updated_at.desc()).all()
    elif current_user.role == 'ADMIN':
        projects = Project.query.order_by(Project.updated_at.desc()).all()
    else:
        member_project_ids = [m.project_id for m in ProjectMember.query.filter_by(user_id=current_user.id).all()]
        projects = Project.query.filter((Project.student_id == current_user.id) | (Project.id.in_(member_project_ids))).order_by(Project.updated_at.desc()).all()

    return jsonify({'projects': [p.to_dict() for p in projects]}), 200

@project_bp.route('/<int:project_id>', methods=['GET'])
@token_required
def get_project(current_user, project_id):
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    data = project.to_dict()
    data['members'] = [m.to_dict() for m in project.members]
    data['reviews'] = [r.to_dict() for r in project.reviews]

    return jsonify({'project': data}), 200

@project_bp.route('', methods=['POST'])
@token_required
def create_project(current_user):
    if current_user.role != 'STUDENT' and current_user.role != 'ADMIN':
        return jsonify({'message': 'Only students can create research projects'}), 403

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    domain = data.get('domain', 'Artificial Intelligence')
    faculty_id = data.get('faculty_id')

    if not title or not description:
        return jsonify({'message': 'Title and description are required'}), 400

    # If faculty_id is specified by student, verify faculty has ACCEPTED an advisor request
    if faculty_id and current_user.role == 'STUDENT':
        accepted_req = AdvisorRequest.query.filter_by(student_id=current_user.id, faculty_id=faculty_id, status='ACCEPTED').first()
        if not accepted_req:
            return jsonify({'message': 'Selected faculty member has not accepted an advisor request from you yet. Please send an advisor request first and wait for faculty acceptance.'}), 400

    project = Project(
        title=title,
        abstract=data.get('abstract', ''),
        description=description,
        domain=domain,
        keywords=data.get('keywords', ''),
        technologies=data.get('technologies', ''),
        status='PROPOSED' if faculty_id else 'IDEA',
        student_id=current_user.id,
        faculty_id=faculty_id
    )
    db.session.add(project)
    db.session.commit()

    return jsonify({'message': 'Project created successfully!', 'project': project.to_dict()}), 201

@project_bp.route('/<int:project_id>', methods=['PUT'])
@token_required
def update_project(current_user, project_id):
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    is_owner = (project.student_id == current_user.id)
    is_faculty = (project.faculty_id == current_user.id or current_user.role == 'FACULTY')
    is_admin = (current_user.role == 'ADMIN')

    if not (is_owner or is_faculty or is_admin):
        return jsonify({'message': 'Unauthorized to modify this project'}), 403

    data = request.get_json() or {}
    project.title = data.get('title', project.title)
    project.abstract = data.get('abstract', project.abstract)
    project.description = data.get('description', project.description)
    project.domain = data.get('domain', project.domain)
    project.keywords = data.get('keywords', project.keywords)
    project.technologies = data.get('technologies', project.technologies)
    
    new_faculty_id = data.get('faculty_id')
    if new_faculty_id and new_faculty_id != project.faculty_id and current_user.role == 'STUDENT':
        accepted_req = AdvisorRequest.query.filter_by(student_id=current_user.id, faculty_id=new_faculty_id, status='ACCEPTED').first()
        if not accepted_req:
            return jsonify({'message': 'Selected faculty member has not accepted an advisor request from you yet.'}), 400
        project.faculty_id = new_faculty_id

    new_status = data.get('status')
    if new_status and new_status.upper() in ['IDEA', 'PROPOSED', 'UNDER_REVIEW', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']:
        project.status = new_status.upper()

    db.session.commit()
    return jsonify({'message': 'Project updated successfully!', 'project': project.to_dict()}), 200

@project_bp.route('/<int:project_id>/submit', methods=['POST'])
@token_required
def submit_project(current_user, project_id):
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    if project.student_id != current_user.id and current_user.role != 'ADMIN':
        return jsonify({'message': 'Only project creator can submit project for review'}), 403

    data = request.get_json() or {}
    faculty_id = data.get('faculty_id') or project.faculty_id

    if not faculty_id:
        return jsonify({'message': 'Please select a faculty advisor to submit your project to.'}), 400

    # Verify advisor acceptance
    if current_user.role == 'STUDENT':
        accepted_req = AdvisorRequest.query.filter_by(student_id=current_user.id, faculty_id=faculty_id, status='ACCEPTED').first()
        if not accepted_req:
            return jsonify({'message': 'Selected faculty advisor has not accepted an advisor request from you yet.'}), 400

    project.faculty_id = faculty_id
    project.status = 'UNDER_REVIEW'
    db.session.commit()

    return jsonify({'message': 'Project submitted to faculty for review successfully!', 'project': project.to_dict()}), 200

@project_bp.route('/<int:project_id>/members', methods=['POST'])
@token_required
def add_member(current_user, project_id):
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    if project.student_id != current_user.id and current_user.role != 'ADMIN':
        return jsonify({'message': 'Only project creator can add team members'}), 403

    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({'message': 'Student email is required'}), 400

    member_user = User.query.filter_by(email=email).first()
    if not member_user:
        return jsonify({'message': f'No user found with email {email}'}), 404

    existing = ProjectMember.query.filter_by(project_id=project_id, user_id=member_user.id).first()
    if existing or member_user.id == project.student_id:
        return jsonify({'message': 'User is already a member or owner of this project'}), 400

    pm = ProjectMember(project_id=project_id, user_id=member_user.id, role=data.get('role', 'Collaborator'))
    db.session.add(pm)
    db.session.commit()

    return jsonify({'message': 'Team member added successfully!', 'member': pm.to_dict()}), 201

@project_bp.route('/<int:project_id>/reviews', methods=['POST'])
@token_required
def add_project_review(current_user, project_id):
    if current_user.role != 'FACULTY' and current_user.role != 'ADMIN':
        return jsonify({'message': 'Only faculty members can review projects'}), 403

    project = Project.query.get(project_id)
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    data = request.get_json() or {}
    comments = data.get('comments', '').strip()
    review_status = data.get('status', 'APPROVED').upper()

    if not comments:
        return jsonify({'message': 'Review comments are required'}), 400

    review = ProjectReview(
        project_id=project_id,
        faculty_id=current_user.id,
        status=review_status,
        comments=comments
    )
    db.session.add(review)

    if review_status == 'APPROVED':
        project.status = 'APPROVED'
        project.faculty_id = current_user.id
    elif review_status == 'REJECTED':
        project.status = 'REJECTED'
    elif review_status == 'REVISION_REQUESTED':
        project.status = 'PROPOSED'

    db.session.commit()

    return jsonify({'message': 'Faculty review submitted successfully!', 'review': review.to_dict(), 'project_status': project.status}), 201
