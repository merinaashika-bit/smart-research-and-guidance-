from flask import Blueprint, request, jsonify
from backend.models.database import db, User, Message, StudentProfile, FacultyProfile, GroupMember
from backend.routes.auth_middleware import token_required

message_bp = Blueprint('messages', __name__, url_prefix='/api/messages')

@message_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(current_user):
    """Retrieves list of active direct message contacts for the user."""
    # Find all distinct user IDs with whom current_user exchanged messages
    sent = db.session.query(Message.receiver_id).filter(Message.sender_id == current_user.id, Message.receiver_id != None).distinct()
    received = db.session.query(Message.sender_id).filter(Message.receiver_id == current_user.id).distinct()
    
    contact_ids = set([r[0] for r in sent.all()] + [r[0] for r in received.all()])
    
    contacts = []
    for uid in contact_ids:
        u = User.query.get(uid)
        if u and u.is_active:
            sp = StudentProfile.query.filter_by(user_id=uid).first()
            fp = FacultyProfile.query.filter_by(user_id=uid).first()
            name = sp.full_name if sp else (fp.full_name if fp else u.email)
            
            # Count unread
            unread_count = Message.query.filter_by(sender_id=uid, receiver_id=current_user.id, is_read=False).count()
            last_msg = Message.query.filter(
                ((Message.sender_id == current_user.id) & (Message.receiver_id == uid)) |
                ((Message.sender_id == uid) & (Message.receiver_id == current_user.id))
            ).order_by(Message.timestamp.desc()).first()

            contacts.append({
                'user_id': uid,
                'email': u.email,
                'full_name': name,
                'role': u.role,
                'unread_count': unread_count,
                'last_message': last_msg.content if last_msg else '',
                'last_timestamp': last_msg.timestamp.isoformat() if last_msg and last_msg.timestamp else None
            })

    # Sort by last message timestamp
    contacts.sort(key=lambda x: x['last_timestamp'] or '', reverse=True)
    return jsonify({'contacts': contacts}), 200

@message_bp.route('/direct/<int:target_user_id>', methods=['GET'])
@token_required
def get_direct_messages(current_user, target_user_id):
    messages = Message.query.filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == target_user_id)) |
        ((Message.sender_id == target_user_id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp.asc()).all()

    # Mark received messages as read
    for m in messages:
        if m.receiver_id == current_user.id and not m.is_read:
            m.is_read = True
    db.session.commit()

    return jsonify({'messages': [m.to_dict() for m in messages]}), 200

@message_bp.route('/direct', methods=['POST'])
@token_required
def send_direct_message(current_user):
    data = request.get_json() or {}
    receiver_id = data.get('receiver_id')
    content = data.get('content', '').strip()

    if not receiver_id or not content:
        return jsonify({'message': 'Receiver ID and content are required'}), 400

    receiver = User.query.get(receiver_id)
    if not receiver:
        return jsonify({'message': 'Receiver user not found'}), 404

    msg = Message(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=content
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({'message': 'Message sent successfully!', 'data': msg.to_dict()}), 201

@message_bp.route('/group/<int:group_id>', methods=['GET'])
@token_required
def get_group_messages(current_user, group_id):
    # Verify user is a member of the group
    membership = GroupMember.query.filter_by(group_id=group_id, user_id=current_user.id).first()
    if not membership and current_user.role != 'ADMIN':
        return jsonify({'message': 'You must join the group to view messages'}), 403

    messages = Message.query.filter_by(group_id=group_id).order_by(Message.timestamp.asc()).all()
    return jsonify({'messages': [m.to_dict() for m in messages]}), 200

@message_bp.route('/group', methods=['POST'])
@token_required
def send_group_message(current_user):
    data = request.get_json() or {}
    group_id = data.get('group_id')
    content = data.get('content', '').strip()

    if not group_id or not content:
        return jsonify({'message': 'Group ID and content are required'}), 400

    membership = GroupMember.query.filter_by(group_id=group_id, user_id=current_user.id).first()
    if not membership and current_user.role != 'ADMIN':
        return jsonify({'message': 'You must join the group to send messages'}), 403

    msg = Message(
        sender_id=current_user.id,
        group_id=group_id,
        content=content
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({'message': 'Group message sent successfully!', 'data': msg.to_dict()}), 201
