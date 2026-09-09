# Smart Research Guidance & Recommendation Platform

A full-stack, Machine Learning-driven academic web application designed for college/university students to discover research topics, match with faculty advisors, manage research projects, collaborate in research groups, and receive AI guidance via Google Gemini.

---

## 🌟 Key Features

1. **Machine Learning Recommendation Engine**:
   - Computes genuine **TF-IDF Vectorization** and **Cosine Similarity** scores on a 30+ research topics dataset.
   - Ranks research topics and faculty advisors with exact percentage match scores (e.g., **92.5% Match**).

2. **AI Research Assistant**:
   - Powered by **Google Gemini API** (`GEMINI_API_KEY`).
   - Answers academic queries, explains algorithms, recommends datasets, and assists with methodology.
   - Stores full chat history in the database.

3. **Multi-Role System**:
   - **Student**: Create profile, input interests, discover topics, match with faculty, create & manage projects, join groups, direct message faculty/students.
   - **Faculty / Advisor**: Manage research expertise, view advisor requests queue (accept/reject), review submitted student projects with feedback timeline.
   - **Admin**: View platform analytics, activate/deactivate user accounts, manage research topic dataset.

4. **Research Project Management**:
   - Interactive status pipeline: `IDEA` → `PROPOSED` → `UNDER_REVIEW` → `APPROVED` → `IN_PROGRESS` → `COMPLETED`.
   - Team member invitation and faculty feedback timeline.

5. **Collaboration & Communication**:
   - One-to-one direct messaging between students and faculty.
   - Student Research Groups with real-time **Flask-SocketIO** WebSocket chat.

---

## 🎓 Machine Learning Component: Interview Explanation Guide

Use this section to confidently explain the Machine Learning recommendation engine during technical interviews:

### 1. What Dataset Was Used?
The recommendation engine uses a curated academic dataset located at `backend/ml/dataset/research_topics.csv` containing 30+ research topics across 10 core computer science domains (AI, NLP, Machine Learning, Cybersecurity, Computer Vision, Data Science, IoT, Cloud Computing, Web Development, Software Engineering).

### 2. What Features Were Extracted?
Text features are extracted by combining fields:
- `research_topic` (Title)
- `domain` (Domain category)
- `keywords` (Tags)
- `description` (Detailed narrative)
- `required_skills` (Prerequisite technologies)
- `faculty_expertise` (Faculty domain coverage)

### 3. Why Was TF-IDF (Term Frequency - Inverse Document Frequency) Used?
- **Term Frequency (TF)**: Measures how frequently a word appears in a topic description:
  $$\text{TF}(t, d) = \frac{\text{count}(t \text{ in } d)}{\text{total words in } d}$$
- **Inverse Document Frequency (IDF)**: Downweights generic words (like "research", "system") and highlights specific domain terms (like "NLP", "BERT", "Ransomware"):
  $$\text{IDF}(t, D) = \log\left(\frac{N}{|\{d \in D : t \in d\}|}\right)$$
- **TF-IDF Vector**: Multiplying $\text{TF} \times \text{IDF}$ produces a high-dimensional sparse vector representing the semantic weight of terms in each topic and student interest string.

### 4. How Cosine Similarity Works in This Project
Cosine similarity calculates the cosine of the angle between the student's interest vector $\mathbf{A}$ and a research topic vector $\mathbf{B}$:
$$\text{Cosine Similarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$

- A value of **1.0** indicates identical term weight distribution.
- A value of **0.0** indicates no vocabulary overlap.
- Match scores are converted to user-friendly percentages: $\text{Match Score} = \text{round}(\text{Similarity} \times 100, 1)\%$.

### 5. How Faculty Advisor Matching Works
Faculty profiles (expertise, research interests, department, designation) are converted into a TF-IDF text corpus. When a student enters their interests, their TF-IDF vector is compared against all faculty vectors in the database using Cosine Similarity, producing a ranked list of recommended advisors.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Bootstrap 5, Lucide React Icons, Axios, Socket.io-client.
- **Backend**: Python 3.7+, Flask, Flask-SQLAlchemy, Flask-CORS, PyJWT, Flask-SocketIO.
- **Machine Learning**: Scikit-Learn (`TfidfVectorizer`, `cosine_similarity`), Pandas, NumPy.
- **AI Integration**: Google Gemini API via REST API client (`GEMINI_API_KEY`).
- **Database**: SQLite with SQLAlchemy ORM.

---

## 📁 Project Structure

```
smart-research-platform/
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── MatchScoreBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   └── pages/
│   │       ├── LandingPage.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── StudentDashboard.jsx
│   │       ├── FacultyDashboard.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── StudentProfile.jsx
│   │       ├── FacultyProfile.jsx
│   │       ├── ResearchRecommendations.jsx
│   │       ├── FacultyRecommendations.jsx
│   │       ├── ProjectManagement.jsx
│   │       ├── ProjectDetails.jsx
│   │       ├── GroupsPage.jsx
│   │       ├── GroupChat.jsx
│   │       ├── MessagesPage.jsx
│   │       └── AIResearchAssistant.jsx
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── seed_data.py
│   ├── test_api.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   └── database.py
│   ├── ml/
│   │   ├── preprocessing.py
│   │   ├── topic_recommender.py
│   │   ├── faculty_recommender.py
│   │   ├── recommendation.py
│   │   ├── test_ml.py
│   │   └── dataset/
│   │       └── research_topics.csv
│   ├── chatbot/
│   │   └── gemini_service.py
│   └── routes/
│       ├── auth_middleware.py
│       ├── auth_routes.py
│       ├── student_routes.py
│       ├── faculty_routes.py
│       ├── ml_routes.py
│       ├── project_routes.py
│       ├── group_routes.py
│       ├── message_routes.py
│       ├── chatbot_routes.py
│       └── admin_routes.py
│
└── README.md
```

---

## ⚡ Installation & Setup Guide

### 1. Prerequisites
- Python 3.7+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment (optional)
python -m venv venv
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and set your GEMINI_API_KEY (optional)
cp .env.example .env

# Run Flask Backend Server
python app.py
```
The backend API will start on `http://localhost:5000` and automatically seed initial sample users, faculty profiles, dataset topics, and research projects into `research_platform.db`.

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server
npm run dev
```
The frontend web application will start on `http://localhost:5173`.

---

## 🔑 Pre-Seeded Quick Demo Accounts

| Role | Email | Password | Description |
|---|---|---|---|
| **Student** | `student@university.edu` | `student123` | Senior CS Student interested in NLP & Chatbots |
| **Faculty** | `dr.turing@university.edu` | `password123` | Dr. Alan Turing (Expert in AI & NLP) |
| **Faculty** | `dr.hinton@university.edu` | `password123` | Dr. Geoffrey Hinton (Expert in Computer Vision) |
| **Admin** | `admin@university.edu` | `admin123` | Platform System Administrator |

---

## 🔮 Future Enhancements
- Integration with Semantic Scholar / IEEE Xplore APIs for automated paper reference extraction.
- Advanced Deep Learning Sentence-BERT embeddings alongside TF-IDF.
- Mobile application using React Native.
