import requests
import re

API_KEY = "AIzaSyA4lVSciggCKVxhBFRYtUiC4xlQbX_ayjE"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={API_KEY}"

def clean_text(text):
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'Riddle (\d+):', r'\nRiddle \1:', text)
    text = re.sub(r'Who am I\?', r'Who am I?\n', text)
    text = re.sub(r'\. \.\. ', '\n', text)
    return re.sub(r'\s+', ' ', text.strip())

def get_gemini_response(question):
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{"role": "user", "parts": [{"text": question}]}],
        "generationConfig": {
            "temperature": 1,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 8192,
            "responseMimeType": "text/plain"
        }
    }
    
    response = requests.post(URL, headers=headers, json=data)
    if response.status_code == 200:
        content = response.json().get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        return clean_text(content) if content else "No valid content in response."
    return f"Error: {response.status_code}, {response.text}"