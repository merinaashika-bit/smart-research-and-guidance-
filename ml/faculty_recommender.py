import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from backend.ml.preprocessing import clean_text

class FacultyRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))

    def recommend(self, student_interests_text, faculty_profiles, top_n=5):
        """
        Recommends faculty advisors matching student interests using TF-IDF and Cosine Similarity.
        
        faculty_profiles: List of dicts representing faculty members:
          [{'id': 1, 'user_id': 2, 'full_name': 'Dr. Alice', 'department': 'CS', 'expertise': 'AI, NLP', 'interests': 'Chatbots, Sentiment Analysis'}]
        """
        if not student_interests_text or not faculty_profiles:
            return []

        cleaned_user_text = clean_text(student_interests_text)
        if not cleaned_user_text:
            return []

        # Prepare faculty text feature representations
        faculty_texts = []
        for f in faculty_profiles:
            combined = f"{f.get('full_name', '')} {f.get('department', '')} {f.get('designation', '')} {f.get('expertise', '')} {f.get('interests', '')} {f.get('bio', '')}"
            faculty_texts.append(clean_text(combined))

        if not any(faculty_texts):
            return []

        # Fit vectorizer on faculty corpus + user input text to ensure shared vocabulary space
        corpus = faculty_texts + [cleaned_user_text]
        tfidf_matrix = self.vectorizer.fit_transform(corpus)

        # User vector is the last row in the matrix
        user_vector = tfidf_matrix[-1:]
        faculty_vectors = tfidf_matrix[:-1]

        # Calculate cosine similarity between student vector and each faculty vector
        similarity_scores = cosine_similarity(user_vector, faculty_vectors).flatten()

        results = []
        for i, faculty in enumerate(faculty_profiles):
            raw_score = float(similarity_scores[i])
            match_percentage = round(raw_score * 100, 1)

            # Ensure realistic scoring curve if vocabulary overlap exists
            if match_percentage < 10.0:
                # Check for direct word matches in expertise/interests
                exp_text = (str(faculty.get('expertise', '')) + " " + str(faculty.get('interests', ''))).lower()
                user_words = set(cleaned_user_text.split())
                matches = sum(1 for w in user_words if len(w) > 2 and w in exp_text)
                if matches > 0:
                    match_percentage = round(min(25.0 + matches * 15.0, 96.0), 1)

            faculty_item = dict(faculty)
            faculty_item['match_score'] = match_percentage
            faculty_item['similarity_score'] = raw_score
            results.append(faculty_item)

        # Sort descending by match_score
        results.sort(key=lambda x: x['match_score'], reverse=True)
        return results[:top_n]
