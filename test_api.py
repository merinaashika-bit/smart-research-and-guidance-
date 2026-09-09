import os
import sys
import unittest
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import app
from backend.models.database import db

class TestSmartResearchAPI(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        print("[API Test Passed]: Health Check")

    def test_02_login_student(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'student@university.edu',
            'password': 'student123'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('token', data)
        self.assertEqual(data['user']['role'], 'STUDENT')
        print("[API Test Passed]: Student Login & JWT Token Issue")

    def test_03_login_faculty(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'dr.turing@university.edu',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['user']['role'], 'FACULTY')
        print("[API Test Passed]: Faculty Login")

    def test_04_ml_topic_recommendation(self):
        # 1. Login to get token
        login_res = self.client.post('/api/auth/login', json={
            'email': 'student@university.edu',
            'password': 'student123'
        })
        token = login_res.get_json()['token']

        # 2. Call ML Topic Recommendation API
        res = self.client.post('/api/recommendations/topics', 
            json={'interests': 'NLP, sentiment analysis, chatbots'},
            headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(res.status_code, 200)
        recs = res.get_json()['recommendations']
        self.assertGreater(len(recs), 0)
        # Verify first match score is positive number
        self.assertGreater(recs[0]['match_score'], 0)
        print(f"[API Test Passed]: ML Topic Recommendations ({len(recs)} topics returned, top match score: {recs[0]['match_score']}%)")

    def test_05_ml_faculty_recommendation(self):
        login_res = self.client.post('/api/auth/login', json={
            'email': 'student@university.edu',
            'password': 'student123'
        })
        token = login_res.get_json()['token']

        res = self.client.post('/api/recommendations/faculty', 
            json={'interests': 'NLP, chatbot, artificial intelligence'},
            headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(res.status_code, 200)
        recs = res.get_json()['recommendations']
        self.assertGreater(len(recs), 0)
        print(f"[API Test Passed]: ML Faculty Matching ({len(recs)} advisors matched, top match: {recs[0]['full_name']} {recs[0]['match_score']}%)")

if __name__ == '__main__':
    unittest.main()
