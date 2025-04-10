from flask import Flask, request, jsonify, render_template, redirect, url_for, session
import google.generativeai as genai
from werkzeug.security import generate_password_hash, check_password_hash
import time

app = Flask(__name__)
app.secret_key = "your-secret-key-here"  
GEMINI_API_KEY = "AIzaSyBVI-1lvktyNikumOK4xFxP4gNW62nFI2o" 
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")
users = {}
last_question = {}  # Track user context

def get_ergo_response(question, username):
    time.sleep(2.5)  # Thinking delay
    question = question.lower().strip()

    # Build context from last question
    context = last_question.get(username, "")
    if context:
        context_prompt = f"Previous question: {context}\n"
    else:
        context_prompt = ""

    # Comprehensive prompt for human-like behavior
    prompt = (
        "You’re a friendly, chatty ergonomics buddy—like a coworker who knows their stuff. "
        "Respond in a casual, human tone with practical tips about workspace setup, posture, or stretches. "
        "Keep it short, relatable, and conversational, like you’re talking to a friend. "
        "If the question is a greeting (e.g., 'hello', 'hi'), greet back warmly and offer help with ergonomics. "
        "If it’s vague or a follow-up (e.g., 'okey', 'yes', 'yup'), assume it relates to the last ergonomic topic and expand on it—or suggest something useful if there’s no context. "
        "If it’s clearly off-topic (e.g., math, random numbers), apologize naturally and steer back to ergonomics with a suggestion. "
        "Don’t repeat yourself—keep each response fresh and unique.\n\n"
        f"{context_prompt}Current question: {question}"
    )

    try:
        response = model.generate_content(prompt)
        # Update context if it’s ergonomics-related (basic check)
        ergo_keywords = ["desk", "chair", "posture", "stretch", "workspace", "sitting", "standing", "walking", 
                         "neck", "back", "exercise", "shoulder", "wrist", "ergonomic", "setup", "position", 
                         "move", "movement", "adjust", "comfort"]
        if any(keyword in question for keyword in ergo_keywords):
            last_question[username] = question
        else:
            last_question[username] = None
        return response.text.strip()
    except Exception as e:
        return f"Oops, something went wrong: {str(e)}"

@app.route('/')
def home():
    if 'username' in session:
        return redirect(url_for('chat'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users and check_password_hash(users[username], password):
            session['username'] = username
            return redirect(url_for('chat'))
        return render_template('login.html', error="Invalid credentials")
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users:
            return render_template('signup.html', error="Username already exists")
        users[username] = generate_password_hash(password)
        session['username'] = username
        return redirect(url_for('chat'))
    return render_template('signup.html')

@app.route('/chat')
def chat():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('chat.html', username=session['username'])

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/ask', methods=['POST'])
def ask():
    if 'username' not in session:
        return jsonify({"error": "Please log in first"}), 401
    data = request.get_json()
    if not data or "question" not in data:
        return jsonify({"error": "Please send a question"}), 400
    question = data["question"]
    response = get_ergo_response(question, session['username'])
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)