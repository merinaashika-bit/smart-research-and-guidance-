import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app
from backend.models.database import User

def generate_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }
    secret_key = current_app.config.get('JWT_SECRET_KEY', 'default_jwt_secret_key_change_in_prod')
    return jwt.encode(payload, secret_key, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Authorization token is missing!'}), 401
        
        try:
            secret_key = current_app.config.get('JWT_SECRET_KEY', 'default_jwt_secret_key_change_in_prod')
            data = jwt.decode(token, secret_key, algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user or not current_user.is_active:
                return jsonify({'message': 'Invalid or inactive user!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired! Please log in again.'}), 401
        except Exception as e:
            return jsonify({'message': 'Invalid token signature!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in allowed_roles:
                return jsonify({'message': f'Access forbidden! Role required: {allowed_roles}'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
