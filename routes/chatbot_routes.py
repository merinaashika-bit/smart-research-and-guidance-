from flask import Blueprint, request, jsonify
from backend.models.database import db, ChatHistory
from backend.routes.auth_middleware import token_required
from backend.chatbot.gemini_service import GeminiResearchAssistant

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api/chatbot')
assistant = GeminiResearchAssistant()

@chatbot_bp.route('/ask', methods=['POST'])
@token_required
def ask_chatbot(current_user):
    data = request.get_json() or {}
    user_prompt = data.get('prompt', '').strip()

    if not user_prompt:
        return jsonify({'message': 'Prompt question cannot be empty'}), 400

    # Fetch recent chat history to maintain conversation context
    history_records = ChatHistory.query.filter_by(user_id=current_user.id).order_by(ChatHistory.timestamp.desc()).limit(5).all()
    history_records.reverse()
    context_history = [{'prompt': h.prompt, 'response': h.response} for h in history_records]

    # Generate response via Gemini Assistant
    ai_response = assistant.generate_response(user_prompt, conversation_history=context_history)

    # Save to database
    chat_entry = ChatHistory(
        user_id=current_user.id,
        prompt=user_prompt,
        response=ai_response
    )
    db.session.add(chat_entry)
    db.session.commit()

    return jsonify({
        'message': 'Response generated successfully',
        'chat': chat_entry.to_dict()
    }), 200

@chatbot_bp.route('/history', methods=['GET'])
@token_required
def get_chat_history(current_user):
    history = ChatHistory.query.filter_by(user_id=current_user.id).order_by(ChatHistory.timestamp.asc()).all()
    return jsonify({'history': [h.to_dict() for h in history]}), 200

@chatbot_bp.route('/history', methods=['DELETE'])
@token_required
def clear_chat_history(current_user):
    ChatHistory.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return jsonify({'message': 'Chat history cleared successfully'}), 200
