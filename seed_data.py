import os
import sys
import pandas as pd

# Ensure backend package is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.config import Config
from backend.models.database import (
    db, User, StudentProfile, FacultyProfile, ResearchTopic, 
    Project, ProjectMember, ResearchGroup, GroupMember, Message
)

def seed_database(app):
    with app.app_context():
        print("Checking database tables...")
        db.create_all()

        if User.query.first():
            print("Database already contains data. Skipping initial seed.")
            return

        print("Seeding initial users and profiles...")

        # 1. Admin User
        admin = User(email='admin@university.edu', role='ADMIN')
        admin.set_password('admin123')
        db.session.add(admin)

        # 2. Faculty Members
        faculty_data = [
            {
                'email': 'dr.turing@university.edu',
                'password': 'password123',
                'full_name': 'Dr. Alan Turing',
                'department': 'Computer Science',
                'designation': 'Full Professor & Chair',
                'expertise': 'Artificial Intelligence, Natural Language Processing, AI Chatbots, Dialogue Systems',
                'interests': 'NLP, Sentiment Analysis, Dialogue Systems, Text Mining, Deep Learning',
                'bio': 'Pioneer in Machine Intelligence leading the University NLP & Conversational AI Lab.',
                'office_hours': 'Mon/Wed 2:00 PM - 4:00 PM'
            },
            {
                'email': 'dr.hopper@university.edu',
                'password': 'password123',
                'full_name': 'Dr. Grace Hopper',
                'department': 'Software Engineering',
                'designation': 'Associate Professor',
                'expertise': 'Software Engineering, Code Optimization, Automated Testing, Static Analysis',
                'interests': 'Automated Bug Detection, Code Parsing, Microservices, DevOps',
                'bio': 'Directs the Software Reliability and Static Code Analysis Laboratory.',
                'office_hours': 'Tue/Thu 10:00 AM - 12:00 PM'
            },
            {
                'email': 'dr.hinton@university.edu',
                'password': 'password123',
                'full_name': 'Dr. Geoffrey Hinton',
                'department': 'Artificial Intelligence',
                'designation': 'Professor of AI',
                'expertise': 'Deep Learning, Computer Vision, Convolutional Neural Networks, Medical Imaging',
                'interests': 'Computer Vision, Image Segmentation, Autonomous Vehicles, Representation Learning',
                'bio': 'Head of Deep Learning & Vision Perception Systems Group.',
                'office_hours': 'Fri 1:00 PM - 3:00 PM'
            },
            {
                'email': 'dr.shannon@university.edu',
                'password': 'password123',
                'full_name': 'Dr. Claude Shannon',
                'department': 'Cybersecurity & Networks',
                'designation': 'Professor',
                'expertise': 'Cybersecurity, Cryptography, Anomaly Detection, Zero-Trust Architecture',
                'interests': 'Ransomware Detection, Network Defense, Differential Privacy, Federated Learning',
                'bio': 'Researcher specializing in mathematical cryptography and modern cyber defense.',
                'office_hours': 'Mon 11:00 AM - 1:00 PM'
            },
            {
                'email': 'dr.lovelace@university.edu',
                'password': 'password123',
                'full_name': 'Dr. Ada Lovelace',
                'department': 'Data Science & Analytics',
                'designation': 'Associate Professor',
                'expertise': 'Data Science, Predictive Modeling, XGBoost, Explainable AI (XAI)',
                'interests': 'Customer Churn Analysis, Time-Series Forecasting, Interpretability, Tabular Data',
                'bio': 'Focuses on applied statistical modeling and human-interpretable predictive analytics.',
                'office_hours': 'Wed 3:00 PM - 5:00 PM'
            }
        ]

        faculty_users = []
        for fd in faculty_data:
            u = User(email=fd['email'], role='FACULTY')
            u.set_password(fd['password'])
            db.session.add(u)
            db.session.flush() # assign ID

            fp = FacultyProfile(
                user_id=u.id,
                full_name=fd['full_name'],
                department=fd['department'],
                designation=fd['designation'],
                expertise=fd['expertise'],
                interests=fd['interests'],
                bio=fd['bio'],
                office_hours=fd['office_hours'],
                available_for_advising=True
            )
            db.session.add(fp)
            faculty_users.append(u)

        # 3. Student Members
        student_data = [
            {
                'email': 'student@university.edu',
                'password': 'student123',
                'full_name': 'John Doe',
                'department': 'Computer Science',
                'academic_year': 'Senior',
                'interests': 'NLP, sentiment analysis, chatbots, text classification, dialogue systems',
                'skills': 'Python, PyTorch, Flask, Scikit-Learn, React',
                'bio': 'Senior student passionate about building intelligent conversational NLP agents.'
            },
            {
                'email': 'alice@university.edu',
                'password': 'password123',
                'full_name': 'Alice Smith',
                'department': 'Artificial Intelligence',
                'academic_year': 'Junior',
                'interests': 'Computer vision, medical imaging, CNNs, image segmentation, deep learning',
                'skills': 'Python, TensorFlow, OpenCV, PyTorch',
                'bio': 'Junior student exploring computer vision applications in medical healthcare.'
            },
            {
                'email': 'bob@university.edu',
                'password': 'password123',
                'full_name': 'Bob Johnson',
                'department': 'Cybersecurity',
                'academic_year': 'Senior',
                'interests': 'Cybersecurity, ransomware detection, network security, zero-trust',
                'skills': 'Python, Linux, Wireshark, Cryptography, Scikit-learn',
                'bio': 'Cybersecurity enthusiast investigating real-time malware behavioral analysis.'
            }
        ]

        student_users = []
        for sd in student_data:
            u = User(email=sd['email'], role='STUDENT')
            u.set_password(sd['password'])
            db.session.add(u)
            db.session.flush()

            sp = StudentProfile(
                user_id=u.id,
                full_name=sd['full_name'],
                department=sd['department'],
                academic_year=sd['academic_year'],
                interests=sd['interests'],
                skills=sd['skills'],
                bio=sd['bio']
            )
            db.session.add(sp)
            student_users.append(u)

        db.session.commit()

        # 4. Import Topics from research_topics.csv
        csv_path = os.path.join(os.path.dirname(__file__), 'ml', 'dataset', 'research_topics.csv')
        if os.path.exists(csv_path):
            print("Importing research dataset CSV into database...")
            df = pd.read_csv(csv_path)
            for idx, row in df.iterrows():
                rt = ResearchTopic(
                    title=str(row['research_topic']),
                    domain=str(row['domain']),
                    keywords=str(row['keywords']),
                    description=str(row['description']),
                    required_skills=str(row['required_skills']),
                    faculty_id=faculty_users[idx % len(faculty_users)].id
                )
                db.session.add(rt)
            db.session.commit()

        # 5. Seed Sample Research Projects
        print("Seeding sample research projects...")
        p1 = Project(
            title="NLP-Driven Sentiment Classifier for Student Feedback",
            abstract="Developing an automated text mining pipeline to analyze student course evaluation comments.",
            description="This project uses BERT fine-tuning and TF-IDF baseline models to classify sentiment in course reviews and detect areas for academic curriculum improvement.",
            domain="Natural Language Processing",
            keywords="nlp, sentiment analysis, text classification, bert",
            technologies="Python, PyTorch, Transformers, Flask, React",
            status="IN_PROGRESS",
            student_id=student_users[0].id,
            faculty_id=faculty_users[0].id # Dr. Turing
        )
        p2 = Project(
            title="Automated MRI Brain Tumor Segmentation using U-Net",
            abstract="Deep learning framework for automated 3D MRI brain lesion identification.",
            description="Developing convolutional neural network architectures for segmented tissue classification in clinical diagnostic MRI imaging.",
            domain="Computer Vision",
            keywords="computer vision, medical image, unet, cnn",
            technologies="Python, TensorFlow, OpenCV",
            status="PROPOSED",
            student_id=student_users[1].id,
            faculty_id=faculty_users[2].id # Dr. Hinton
        )
        db.session.add_all([p1, p2])
        db.session.commit()

        # 6. Seed Sample Research Groups
        print("Seeding sample research groups...")
        g1 = ResearchGroup(
            name="NLP & Conversational AI Interest Group",
            description="A collaborative study group for students and faculty exploring transformers, LLMs, and chatbot design.",
            topic="Natural Language Processing",
            creator_id=student_users[0].id
        )
        g2 = ResearchGroup(
            name="Cybersecurity & Defense Lab",
            description="Hands-on research group analyzing malware behavioral patterns and privacy-preserving federated machine learning.",
            topic="Cybersecurity",
            creator_id=student_users[2].id
        )
        db.session.add_all([g1, g2])
        db.session.commit()

        # Add group members
        gm1 = GroupMember(group_id=g1.id, user_id=student_users[0].id)
        gm2 = GroupMember(group_id=g1.id, user_id=student_users[1].id)
        gm3 = GroupMember(group_id=g1.id, user_id=faculty_users[0].id)
        gm4 = GroupMember(group_id=g2.id, user_id=student_users[2].id)
        db.session.add_all([gm1, gm2, gm3, gm4])
        db.session.commit()

        print("Database seeded successfully!")
