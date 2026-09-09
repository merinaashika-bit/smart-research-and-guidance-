from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='STUDENT') # STUDENT, FACULTY, ADMIN
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student_profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    faculty_profile = db.relationship('FacultyProfile', backref='user', uselist=False, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    full_name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=True)
    academic_year = db.Column(db.String(20), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    interests = db.Column(db.Text, nullable=True)
    skills = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'department': self.department,
            'academic_year': self.academic_year,
            'bio': self.bio,
            'interests': self.interests,
            'skills': self.skills
        }

class FacultyProfile(db.Model):
    __tablename__ = 'faculty_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    full_name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=True)
    designation = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    expertise = db.Column(db.Text, nullable=True)
    interests = db.Column(db.Text, nullable=True)
    office_hours = db.Column(db.String(100), nullable=True)
    available_for_advising = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'department': self.department,
            'designation': self.designation,
            'bio': self.bio,
            'expertise': self.expertise,
            'interests': self.interests,
            'office_hours': self.office_hours,
            'available_for_advising': self.available_for_advising
        }

class ResearchTopic(db.Model):
    __tablename__ = 'research_topics'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    domain = db.Column(db.String(100), nullable=False)
    keywords = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.Text, nullable=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'domain': self.domain,
            'keywords': self.keywords,
            'description': self.description,
            'required_skills': self.required_skills,
            'faculty_id': self.faculty_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    abstract = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=False)
    domain = db.Column(db.String(100), nullable=False)
    keywords = db.Column(db.Text, nullable=True)
    technologies = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), default='IDEA') # IDEA, PROPOSED, UNDER_REVIEW, APPROVED, IN_PROGRESS, COMPLETED, REJECTED
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    faculty_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = db.relationship('User', foreign_keys=[student_id], backref='student_projects')
    faculty = db.relationship('User', foreign_keys=[faculty_id], backref='faculty_projects')
    members = db.relationship('ProjectMember', backref='project', cascade="all, delete-orphan")
    reviews = db.relationship('ProjectReview', backref='project', cascade="all, delete-orphan")

    def to_dict(self):
        student_profile = StudentProfile.query.filter_by(user_id=self.student_id).first()
        faculty_profile = FacultyProfile.query.filter_by(user_id=self.faculty_id).first() if self.faculty_id else None
        return {
            'id': self.id,
            'title': self.title,
            'abstract': self.abstract,
            'description': self.description,
            'domain': self.domain,
            'keywords': self.keywords,
            'technologies': self.technologies,
            'status': self.status,
            'student_id': self.student_id,
            'student_name': student_profile.full_name if student_profile else "Unknown Student",
            'faculty_id': self.faculty_id,
            'faculty_name': faculty_profile.full_name if faculty_profile else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'member_count': len(self.members) + 1
        }

class ProjectMember(db.Model):
    __tablename__ = 'project_members'
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(50), default='Collaborator')

    user = db.relationship('User', backref='project_memberships')

    def to_dict(self):
        student_profile = StudentProfile.query.filter_by(user_id=self.user_id).first()
        return {
            'id': self.id,
            'project_id': self.project_id,
            'user_id': self.user_id,
            'role': self.role,
            'name': student_profile.full_name if student_profile else self.user.email
        }

class AdvisorRequest(db.Model):
    __tablename__ = 'advisor_requests'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    faculty_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=True)
    status = db.Column(db.String(20), default='PENDING') # PENDING, ACCEPTED, REJECTED
    message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', foreign_keys=[student_id])
    faculty = db.relationship('User', foreign_keys=[faculty_id])

    def to_dict(self):
        student_prof = StudentProfile.query.filter_by(user_id=self.student_id).first()
        faculty_prof = FacultyProfile.query.filter_by(user_id=self.faculty_id).first()
        project = Project.query.get(self.project_id) if self.project_id else None

        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': student_prof.full_name if student_prof else 'Unknown',
            'faculty_id': self.faculty_id,
            'faculty_name': faculty_prof.full_name if faculty_prof else 'Unknown',
            'faculty_department': faculty_prof.department if faculty_prof else '',
            'project_id': self.project_id,
            'project_title': project.title if project else None,
            'status': self.status,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ProjectReview(db.Model):
    __tablename__ = 'project_reviews'
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    faculty_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(30), nullable=False) # APPROVED, REJECTED, REVISION_REQUESTED
    comments = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    faculty = db.relationship('User', foreign_keys=[faculty_id])

    def to_dict(self):
        faculty_prof = FacultyProfile.query.filter_by(user_id=self.faculty_id).first()
        return {
            'id': self.id,
            'project_id': self.project_id,
            'faculty_id': self.faculty_id,
            'faculty_name': faculty_prof.full_name if faculty_prof else 'Faculty Reviewer',
            'status': self.status,
            'comments': self.comments,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ResearchGroup(db.Model):
    __tablename__ = 'research_groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    topic = db.Column(db.String(100), nullable=False)
    group_type = db.Column(db.String(30), default='STUDENT_ONLY') # STUDENT_ONLY, FACULTY_STUDENT
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    members = db.relationship('GroupMember', backref='group', cascade="all, delete-orphan")

    def to_dict(self):
        creator_prof = StudentProfile.query.filter_by(user_id=self.creator_id).first()
        faculty_prof = FacultyProfile.query.filter_by(user_id=self.creator_id).first()
        creator_name = creator_prof.full_name if creator_prof else (faculty_prof.full_name if faculty_prof else 'User')
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'topic': self.topic,
            'group_type': self.group_type or 'STUDENT_ONLY',
            'creator_id': self.creator_id,
            'creator_name': creator_name,
            'member_count': len(self.members),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class GroupMember(db.Model):
    __tablename__ = 'group_members'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('research_groups.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User')

    def to_dict(self):
        student_prof = StudentProfile.query.filter_by(user_id=self.user_id).first()
        faculty_prof = FacultyProfile.query.filter_by(user_id=self.user_id).first()
        name = student_prof.full_name if student_prof else (faculty_prof.full_name if faculty_prof else self.user.email)
        return {
            'id': self.id,
            'group_id': self.group_id,
            'user_id': self.user_id,
            'name': name,
            'role': self.user.role,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None
        }

class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    group_id = db.Column(db.Integer, db.ForeignKey('research_groups.id'), nullable=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

    sender = db.relationship('User', foreign_keys=[sender_id])
    receiver = db.relationship('User', foreign_keys=[receiver_id])

    def to_dict(self):
        s_student = StudentProfile.query.filter_by(user_id=self.sender_id).first()
        s_faculty = FacultyProfile.query.filter_by(user_id=self.sender_id).first()
        sender_name = s_student.full_name if s_student else (s_faculty.full_name if s_faculty else 'User')

        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'sender_name': sender_name,
            'receiver_id': self.receiver_id,
            'group_id': self.group_id,
            'content': self.content,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'is_read': self.is_read
        }

class ChatHistory(db.Model):
    __tablename__ = 'chat_histories'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    prompt = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'prompt': self.prompt,
            'response': self.response,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
