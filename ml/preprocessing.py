import re

def clean_text(text):
    """
    Preprocess and clean input text for TF-IDF vectorization:
    - Lowercase text
    - Remove special characters and punctuation
    - Normalize extra whitespaces
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Replace non-alphanumeric characters (except spaces) with space
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    
    # Collapse multiple whitespaces into a single space
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def combine_features(row, feature_columns):
    """
    Combine multiple text columns into a single descriptive string for TF-IDF processing.
    """
    combined = []
    for col in feature_columns:
        val = row.get(col, '')
        if val and isinstance(val, str):
            combined.append(clean_text(val))
    return " ".join(combined)
