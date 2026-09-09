from flask import Blueprint, request, jsonify
from backend.models.database import db, User, StudentProfile, FacultyProfile
from backend.routes.auth_middleware import generate_token, token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    role = data.get('role', 'STUDENT').upper()
    full_name = data.get('full_name', '').strip()

    if not email or not password or not full_name:
        return jsonify({'message': 'Email, password, and full name are required!'}), 400

    if role not in ['STUDENT', 'FACULTY', 'ADMIN']:
        role = 'STUDENT'

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'Email is already registered!'}), 400

    new_user = User(email=email, role=role)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    if role == 'STUDENT':
        profile = StudentProfile(
            user_id=new_user.id,
            full_name=full_name,
            department=data.get('department', 'Computer Science'),
            academic_year=data.get('academic_year', 'Senior'),
            interests=data.get('interests', 'Artificial Intelligence, Machine Learning'),
            skills=data.get('skills', 'Python, Data Analysis')
        )
        db.session.add(profile)
    elif role == 'FACULTY':
        profile = FacultyProfile(
            user_id=new_user.id,
            full_name=full_name,
            department=data.get('department', 'Computer Science'),
            designation=data.get('designation', 'Associate Professor'),
            expertise=data.get('expertise', 'Artificial Intelligence, Machine Learning, Data Science'),
            interests=data.get('interests', 'Deep Learning, NLP, Neural Networks')
        )
        db.session.add(profile)

    db.session.commit()

    token = generate_token(new_user.id, new_user.role)
    return jsonify({
        'message': 'Registration successful!',
        'token': token,
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'message': 'Email and password are required!'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password!'}), 401

    if not user.is_active:
        return jsonify({'message': 'Your account has been deactivated. Please contact admin.'}), 403

    token = generate_token(user.id, user.role)

    user_info = user.to_dict()
    if user.role == 'STUDENT' and user.student_profile:
        user_info['profile'] = user.student_profile.to_dict()
    elif user.role == 'FACULTY' and user.faculty_profile:
        user_info['profile'] = user.faculty_profile.to_dict()

    return jsonify({
        'message': 'Login successful!',
        'token': token,
        'user': user_info
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    user_info = current_user.to_dict()
    if current_user.role == 'STUDENT' and current_user.student_profile:
        user_info['profile'] = current_user.student_profile.to_dict()
    elif current_user.role == 'FACULTY' and current_user.faculty_profile:
        user_info['profile'] = current_user.faculty_profile.to_dict()

    return jsonify({'user': user_info}), 200
