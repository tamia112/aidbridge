import ollama

def test_connection():
    print("--- Starting AI Connection Test ---")
    try:
        # This sends a simple prompt to Llama3
        response = ollama.chat(model='llama3', messages=[
            {
                'role': 'user',
                'content': 'Say "AidBridge AI is online" if you can hear me.',
            },
        ])
        print("Response from Ollama:")
        print(response['message']['content'])
        print("--- Test Successful! ---")
    except Exception as e:
        print("--- Test Failed ---")
        print(f"Error: {e}")
        print("Make sure Ollama is running (ollama serve) and you have pulled llama3 (ollama pull llama3)")

if __name__ == "__main__":
    test_connection()