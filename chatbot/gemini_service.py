import os
import requests
import json
from flask import current_app

class GeminiResearchAssistant:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv('GEMINI_API_KEY', '')

    def generate_response(self, user_prompt, conversation_history=None):
        """
        Generates an academic research guidance response using the Google Gemini API.
        If GEMINI_API_KEY is missing or invalid, provides a structured fallback response.
        """
        api_key = self.api_key or os.getenv('GEMINI_API_KEY', '')
        
        system_instruction = (
            "You are an expert AI Research Assistant on the Smart Research Guidance & Recommendation Platform. "
            "Your objective is to provide clear, accurate, and encouraging academic guidance to college/university students. "
            "Help them with research methodologies, literature search strategies, algorithms, datasets, paper structuring, "
            "and technical explanations (such as machine learning concepts, TF-IDF, classification, etc.). "
            "Format your answers clearly with Markdown headings, bullet points, and code snippets where relevant. "
            "Do not pretend to replace faculty advisor supervision."
        )

        if api_key and api_key != 'your_google_gemini_api_key_here' and len(api_key.strip()) > 10:
            try:
                # Try primary gemini endpoint via REST API
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key.strip()}"
                
                contents = []
                # Add conversation history if provided
                if conversation_history:
                    for turn in conversation_history[-5:]: # last 5 turns
                        contents.append({"role": "user", "parts": [{"text": turn.get('prompt', '')}]})
                        contents.append({"role": "model", "parts": [{"text": turn.get('response', '')}]})

                contents.append({
                    "role": "user",
                    "parts": [{"text": f"{system_instruction}\n\nStudent Question: {user_prompt}"}]
                })

                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": contents,
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 1500
                    }
                }

                resp = requests.post(url, headers=headers, json=payload, timeout=12)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get('candidates', [])
                    if candidates and 'content' in candidates[0]:
                        parts = candidates[0]['content'].get('parts', [])
                        if parts:
                            return parts[0].get('text', '')
            except Exception as e:
                print(f"[Gemini API Exception]: {e}")

        # Structured academic fallback if API key is not configured or fails
        return self._generate_academic_fallback(user_prompt)

    def _generate_academic_fallback(self, prompt):
        """Generates intelligent academic guidance when Gemini API Key is pending configuration."""
        p_lower = prompt.lower()
        
        if "algorithm" in p_lower or "model" in p_lower:
            return (
                "### Recommended Algorithms for Your Research\n\n"
                "Depending on your problem domain, here are common algorithms widely accepted in peer-reviewed literature:\n\n"
                "1. **Text & NLP Tasks**: TF-IDF + Cosine Similarity, Naive Bayes, BERT, RoBERTa.\n"
                "2. **Classification Tasks**: Random Forest, XGBoost, Support Vector Machines (SVM).\n"
                "3. **Computer Vision**: Convolutional Neural Networks (CNNs), ResNet, YOLOv8.\n"
                "4. **Time Series Forecasting**: LSTM, ARIMA, Transformer-based time series models.\n\n"
                "*(Note: To enable live real-time Gemini API queries, configure your `GEMINI_API_KEY` in `backend/.env`)*"
            )
        elif "tf-idf" in p_lower or "tfidf" in p_lower:
            return (
                "### Understanding TF-IDF (Term Frequency - Inverse Document Frequency)\n\n"
                "**TF-IDF** evaluates how important a word is to a document in a collection or corpus:\n\n"
                "- **Term Frequency (TF)**: Measures how frequently a term appears in a document `TF(t, d) = count(t) / total_words(d)`.\n"
                "- **Inverse Document Frequency (IDF)**: Downweights common words (like 'the', 'is') and highlights rare, informative terms `IDF(t) = log(Total Documents / Documents containing t)`.\n"
                "- **Cosine Similarity**: Measures the cosine of the angle between two TF-IDF vectors to determine text similarity percentage.\n\n"
                "In our platform's Machine Learning recommendation system, student interest text and research topics are converted into TF-IDF vectors to generate cosine match scores."
            )
        elif "dataset" in p_lower:
            return (
                "### Academic Datasets for Research\n\n"
                "Here are high-quality open-access data repositories suitable for academic projects:\n\n"
                "- **Kaggle Datasets**: Large collection of tabular, text, and image datasets.\n"
                "- **UCI Machine Learning Repository**: Benchmark datasets for classification and regression.\n"
                "- **HuggingFace Datasets**: Benchmark NLP corpora for sentiment, translation, and QA.\n"
                "- **Google Dataset Search**: Search engine for scientific and open government data."
            )
        else:
            return (
                f"### Academic Research Guidance\n\n"
                f"Thank you for asking: **'{prompt}'**\n\n"
                "Here is a recommended approach for your research inquiry:\n\n"
                "1. **Formulate Research Questions**: Clearly define the specific problem, dataset scope, and performance metrics.\n"
                "2. **Literature Survey**: Conduct a systematic search on IEEE Xplore, Google Scholar, and arXiv for recent papers (2022-2026).\n"
                "3. **Experimental Framework**: Set up baseline baseline models first before building complex neural architectures.\n"
                "4. **Faculty Consultation**: Submit your project proposal to matching faculty members using our platform's Faculty Advisor recommendation system.\n\n"
                "*(Tip: You can update your `GEMINI_API_KEY` in `backend/.env` for direct online Gemini responses!)*"
            )
