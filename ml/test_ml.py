import os
import sys

# Ensure backend package is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.ml.recommendation import RecommendationEngine

def run_ml_test():
    engine = RecommendationEngine.get_instance()
    
    test_input = "I am interested in NLP, sentiment analysis, chatbots and text classification."
    print("=" * 60)
    print(f"TEST INPUT INTERESTS: '{test_input}'")
    print("=" * 60)
    
    # 1. Topic Recommendations
    print("\n--- TOPIC RECOMMENDATIONS (TF-IDF + Cosine Similarity) ---")
    topics = engine.recommend_topics(test_input, top_n=5)
    for i, topic in enumerate(topics, 1):
        print(f"{i}. {topic['title']} (Domain: {topic['domain']}) -> Match Score: {topic['match_score']}%")
    
    # 2. Faculty Recommendations
    print("\n--- FACULTY RECOMMENDATIONS (TF-IDF + Cosine Similarity) ---")
    sample_faculty = [
        {
            'id': 101, 'user_id': 2, 'full_name': 'Dr. Alan Turing', 'department': 'Computer Science',
            'designation': 'Professor', 'expertise': 'NLP, Natural Language Processing, AI, Chatbots, Dialogue Systems',
            'interests': 'Sentiment analysis, text mining, automated conversation'
        },
        {
            'id': 102, 'user_id': 3, 'full_name': 'Dr. Grace Hopper', 'department': 'Software Engineering',
            'designation': 'Associate Professor', 'expertise': 'Software Engineering, Compiler Design, Automated Testing',
            'interests': 'Bug detection, static analysis, code optimization'
        },
        {
            'id': 103, 'user_id': 4, 'full_name': 'Dr. Geoffrey Hinton', 'department': 'Artificial Intelligence',
            'designation': 'Professor', 'expertise': 'Deep Learning, Neural Networks, Computer Vision, Classification',
            'interests': 'Medical image segmentation, representation learning'
        }
    ]
    faculty = engine.recommend_faculty(test_input, sample_faculty, top_n=3)
    for i, fac in enumerate(faculty, 1):
        print(f"{i}. {fac['full_name']} ({fac['department']}) -> Match Score: {fac['match_score']}%")
        print(f"   Expertise: {fac['expertise']}")
    
    print("\n" + "=" * 60)
    print("ML TEST COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_ml_test()
