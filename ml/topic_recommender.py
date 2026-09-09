import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from backend.ml.preprocessing import clean_text, combine_features

class TopicRecommender:
    def __init__(self, dataset_path=None):
        if dataset_path is None:
            dataset_path = os.path.join(os.path.dirname(__file__), 'dataset', 'research_topics.csv')
        self.dataset_path = dataset_path
        self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        self.df = None
        self.tfidf_matrix = None
        self._load_and_fit_dataset()

    def _load_and_fit_dataset(self):
        """Loads topics dataset and fits TF-IDF vectorizer."""
        if os.path.exists(self.dataset_path):
            self.df = pd.read_csv(self.dataset_path)
            # Combine relevant text fields: title, domain, keywords, description, required_skills
            feature_cols = ['research_topic', 'domain', 'keywords', 'description', 'required_skills', 'faculty_expertise']
            self.df['combined_features'] = self.df.apply(lambda row: combine_features(row, feature_cols), axis=1)
            
            # Fit and transform dataset text features
            self.tfidf_matrix = self.vectorizer.fit_transform(self.df['combined_features'])
        else:
            self.df = pd.DataFrame()
            self.tfidf_matrix = None

    def recommend(self, student_interests_text, top_n=10, domain_filter=None):
        """
        Recommends research topics based on student interest text using Scikit-Learn TF-IDF & Cosine Similarity.
        Returns a list of dicts with calculated match scores (0-100%).
        """
        if not student_interests_text or self.tfidf_matrix is None or self.df.empty:
            return []

        cleaned_input = clean_text(student_interests_text)
        if not cleaned_input:
            return []

        # Vectorize the input student interest text
        user_vector = self.vectorizer.transform([cleaned_input])

        # Compute cosine similarity between user interest vector and all topic vectors
        similarity_scores = cosine_similarity(user_vector, self.tfidf_matrix).flatten()

        # Create copy of dataframe with scores
        df_results = self.df.copy()
        df_results['similarity_score'] = similarity_scores
        df_results['match_score'] = (df_results['similarity_score'] * 100).round(1)

        # Apply domain filter if provided
        if domain_filter and domain_filter != 'ALL':
            df_results = df_results[df_results['domain'].str.lower() == domain_filter.lower()]

        # Filter out 0 match scores and sort descending by match_score
        # Note: If min score is low, we still show highest matches so student gets top ranked recommendations
        df_results = df_results.sort_values(by='similarity_score', ascending=False)

        # Convert top N to list of dicts
        recommendations = []
        for idx, row in df_results.head(top_n).iterrows():
            # Guarantee match score format
            score_val = float(row['match_score'])
            
            # Boost score slightly for exact keyword hits if score is modest, but preserve cosine rank
            if score_val < 15.0 and any(k.strip().lower() in cleaned_input for k in str(row['keywords']).split(',')):
                score_val = min(score_val + 20.0, 95.0)

            recommendations.append({
                'topic_id': int(row.get('topic_id', idx + 1)),
                'research_topic': str(row.get('research_topic', '')),
                'title': str(row.get('research_topic', '')),
                'domain': str(row.get('domain', '')),
                'keywords': str(row.get('keywords', '')),
                'description': str(row.get('description', '')),
                'required_skills': str(row.get('required_skills', '')),
                'faculty_expertise': str(row.get('faculty_expertise', '')),
                'match_score': round(score_val, 1)
            })

        return recommendations
