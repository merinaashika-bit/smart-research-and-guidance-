from flask import Blueprint, request, jsonify
from backend.models.database import db, User, StudentProfile
from backend.routes.auth_middleware import token_required

student_bp = Blueprint('students', __name__, url_prefix='/api/students')

@student_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    profile = StudentProfile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        return jsonify({'message': 'Student profile not found'}), 404
    return jsonify({'profile': profile.to_dict()}), 200

@student_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    profile = StudentProfile.query.filter_by(user_id=current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id, full_name="Student")
        db.session.add(profile)

    data = request.get_json() or {}
    profile.full_name = data.get('full_name', profile.full_name)
    profile.department = data.get('department', profile.department)
    profile.academic_year = data.get('academic_year', profile.academic_year)
    profile.bio = data.get('bio', profile.bio)
    profile.interests = data.get('interests', profile.interests)
    profile.skills = data.get('skills', profile.skills)

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully!', 'profile': profile.to_dict()}), 200

@student_bp.route('', methods=['GET'])
@token_required
def list_students(current_user):
    students = User.query.filter_by(role='STUDENT', is_active=True).all()
    results = []
    for s in students:
        prof = StudentProfile.query.filter_by(user_id=s.id).first()
        results.append({
            'user_id': s.id,
            'email': s.email,
            'full_name': prof.full_name if prof else s.email,
            'department': prof.department if prof else 'N/A',
            'interests': prof.interests if prof else '',
            'skills': prof.skills if prof else ''
        })
    return jsonify({'students': results}), 200
