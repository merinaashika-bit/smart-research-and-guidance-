import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room

from backend.config import Config
from backend.models.database import db, Message, User, StudentProfile, FacultyProfile
from backend.seed_data import seed_database

# Initialize Flask app factory
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend Vite dev server (port 5173 / localhost)
CORS(app, resources={r"/api/*": {"origins": "*"}, r"/socket.io/*": {"origins": "*"}})

# Initialize SQLAlchemy
db.init_app(app)

# Initialize SocketIO for real-time communication
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent' if 'gevent' in sys.modules else 'threading')

# Register REST Blueprints
from backend.routes.auth_routes import auth_bp
from backend.routes.student_routes import student_bp
from backend.routes.faculty_routes import faculty_bp
from backend.routes.ml_routes import ml_bp
from backend.routes.project_routes import project_bp
from backend.routes.group_routes import group_bp
from backend.routes.message_routes import message_bp
from backend.routes.chatbot_routes import chatbot_bp
from backend.routes.admin_routes import admin_bp

app.register_blueprint(auth_bp)
app.register_blueprint(student_bp)
app.register_blueprint(faculty_bp)
app.register_blueprint(ml_bp)
app.register_blueprint(project_bp)
app.register_blueprint(group_bp)
app.register_blueprint(message_bp)
app.register_blueprint(chatbot_bp)
app.register_blueprint(admin_bp)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'app': 'SMART RESEARCH GUIDANCE & RECOMMENDATION PLATFORM API',
        'version': '1.0.0'
    }), 200

# WebSocket Real-Time Event Handlers
@socketio.on('connect')
def handle_connect():
    print('[SocketIO] Client connected')

@socketio.on('join_room')
def handle_join_room(data):
    room = data.get('room')
    if room:
        join_room(room)
        emit('status', {'msg': f'Joined room: {room}'}, room=room)

@socketio.on('leave_room')
def handle_leave_room(data):
    room = data.get('room')
    if room:
        leave_room(room)
        emit('status', {'msg': f'Left room: {room}'}, room=room)

@socketio.on('send_group_message')
def handle_send_group_msg(data):
    group_id = data.get('group_id')
    sender_id = data.get('sender_id')
    content = data.get('content')

    if group_id and sender_id and content:
        msg = Message(sender_id=sender_id, group_id=group_id, content=content)
        db.session.add(msg)
        db.session.commit()
        
        room = f"group_{group_id}"
        emit('new_group_message', msg.to_dict(), room=room)

@socketio.on('send_direct_message')
def handle_send_direct_msg(data):
    sender_id = data.get('sender_id')
    receiver_id = data.get('receiver_id')
    content = data.get('content')

    if sender_id and receiver_id and content:
        msg = Message(sender_id=sender_id, receiver_id=receiver_id, content=content)
        db.session.add(msg)
        db.session.commit()

        # Emit to both sender and receiver rooms
        emit('new_direct_message', msg.to_dict(), room=f"user_{sender_id}")
        emit('new_direct_message', msg.to_dict(), room=f"user_{receiver_id}")

# Auto-seed database tables on startup
seed_database(app)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"Starting Smart Research Guidance Backend API on port {port}...")
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
