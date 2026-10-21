from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

OLLAMA_URL  = "http://localhost:11434/api/generate"
MODEL_NAME  = "tinyllama"

def analyze_with_llama(text):
    prompt = f"""
    You are an expert fraud detection agent for 'AidBridge', a humanitarian aid platform in Kenya.
    Analyze the following text extracted from a beneficiary's uploaded verification document.

    TEXT: "{text}"

    Consider:
    - Does it look like a real document (ID, medical letter, school letter, etc)?
    - Are there signs of tampering, vagueness, or fraud?
    - Is the need described genuine and specific?

    RETURN ONLY valid JSON, no explanation:
    {{
      "score": (number 0-100, where 100 is fully legitimate),
      "verdict": (one sentence summary of your finding),
      "is_valid": (true if document appears genuine, false if suspicious)
    }}
    """
    payload = {
        "model":  MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    try:
        # 30s timeout — Llama3 can be slow on CPU
        response = requests.post(OLLAMA_URL, json=payload, timeout=30)
        response.raise_for_status()
        return json.loads(response.json()['response'])
    except requests.exceptions.Timeout:
        print("Ollama timeout — returning fallback score")
        return { "score": 50, "verdict": "Analysis timed out. Manual review recommended.", "is_valid": False }
    except Exception as e:
        print(f"Ollama error: {e}")
        return { "score": 50, "verdict": "Analysis failed. Manual review recommended.", "is_valid": False }

@app.route('/verify-document', methods=['POST'])
def verify_document():
    data     = request.get_json()
    text     = data.get('text', '').strip()

    # If no text was extracted, still run AI but flag it
    if not text or text == "PDF document uploaded. Manual review recommended.":
        return jsonify({
            "verificationScore": 45,
            "aiNotes":           "No extractable text found. Document requires manual admin review.",
            "isHighRisk":        False,
            "status":            "Success"
        })

    analysis = analyze_with_llama(text)

    score      = analysis.get("score", 0)
    is_valid   = analysis.get("is_valid", False)
    is_high_risk = not is_valid or score < 30

    return jsonify({
        "verificationScore": score,
        "aiNotes":           analysis.get("verdict", ""),
        "isHighRisk":        is_high_risk,
        "status":            "Success"
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({ "status": "AidBridge AI Service running", "model": MODEL_NAME })

if __name__ == '__main__':
    app.run(port=5001, debug=True)