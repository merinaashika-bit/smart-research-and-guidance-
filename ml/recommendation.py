from backend.ml.topic_recommender import TopicRecommender
from backend.ml.faculty_recommender import FacultyRecommender

class RecommendationEngine:
    _instance = None

    def __init__(self):
        self.topic_recommender = TopicRecommender()
        self.faculty_recommender = FacultyRecommender()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = RecommendationEngine()
        return cls._instance

    def recommend_topics(self, student_interests_text, top_n=10, domain_filter=None):
        return self.topic_recommender.recommend(student_interests_text, top_n=top_n, domain_filter=domain_filter)

    def recommend_faculty(self, student_interests_text, faculty_profiles, top_n=5):
        return self.faculty_recommender.recommend(student_interests_text, faculty_profiles, top_n=top_n)
