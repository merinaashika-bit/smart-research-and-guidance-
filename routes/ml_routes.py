from flask import Blueprint, request, jsonify
from backend.models.database import db, User, FacultyProfile, StudentProfile, ResearchTopic
from backend.routes.auth_middleware import token_required
from backend.ml.recommendation import RecommendationEngine

ml_bp = Blueprint('ml', __name__, url_prefix='/api/recommendations')

@ml_bp.route('/topics', methods=['POST'])
@token_required
def recommend_topics(current_user):
    data = request.get_json() or {}
    interests_input = data.get('interests', '').strip()
    domain_filter = data.get('domain', 'ALL')

    # If no interest input provided, try loading from student profile
    if not interests_input and current_user.role == 'STUDENT':
        student_prof = StudentProfile.query.filter_by(user_id=current_user.id).first()
        if student_prof and student_prof.interests:
            interests_input = f"{student_prof.interests} {student_prof.skills or ''}"

    if not interests_input:
        interests_input = "Machine Learning, Artificial Intelligence, Data Science, Web Development"

    engine = RecommendationEngine.get_instance()
    recommendations = engine.recommend_topics(interests_input, top_n=12, domain_filter=domain_filter)

    return jsonify({
        'query_interests': interests_input,
        'domain_filter': domain_filter,
        'recommendations': recommendations
    }), 200

@ml_bp.route('/faculty', methods=['POST'])
@token_required
def recommend_faculty(current_user):
    data = request.get_json() or {}
    interests_input = data.get('interests', '').strip()

    if not interests_input and current_user.role == 'STUDENT':
        student_prof = StudentProfile.query.filter_by(user_id=current_user.id).first()
        if student_prof and student_prof.interests:
            interests_input = f"{student_prof.interests} {student_prof.skills or ''}"

    if not interests_input:
        interests_input = "Artificial Intelligence, Machine Learning, Data Science, Cybersecurity"

    # Fetch all active faculty members from DB
    faculty_users = User.query.filter_by(role='FACULTY', is_active=True).all()
    faculty_profiles = []
    for f in faculty_users:
        prof = FacultyProfile.query.filter_by(user_id=f.id).first()
        if prof:
            faculty_profiles.append(prof.to_dict())

    engine = RecommendationEngine.get_instance()
    recommendations = engine.recommend_faculty(interests_input, faculty_profiles, top_n=10)

    return jsonify({
        'query_interests': interests_input,
        'recommendations': recommendations
    }), 200
