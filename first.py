from flask import Flask, request, jsonify, render_template, redirect, url_for, session
import google.generativeai as genai
from werkzeug.security import generate_password_hash, check_password_hash
import time

app = Flask(__name__)
app.secret_key = "your-secret-key-here"  
GEMINI_API_KEY = "AIzaSyBVI-1lvktyNikumOK4xFxP4gNW62nFI2o" 

# Configure Gemini API with safety settings
genai.configure(api_key=GEMINI_API_KEY)
generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}

safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_NONE"
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_NONE"
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_NONE"
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_NONE"
    },
]

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
    safety_settings=safety_settings
)

users = {}
last_question = {}  # Track user context

def get_ergo_response(question, username):
    try:
        time.sleep(1.5)  # Thinking delay
        question = question.lower().strip()

        # Build context from last question
        context = last_question.get(username, "")
        if context:
            context_prompt = f"Previous question: {context}\n"
        else:
            context_prompt = ""

        # Check if user is requesting images
        image_request = any(keyword in question for keyword in ["picture", "pictures", "image", "images", "show", "see", "visual", "diagram", "photo", "photos"])
        
        # Comprehensive prompt for human-like behavior
        prompt = (
            "You're a friendly, chatty ergonomics buddy—like a coworker who knows their stuff. "
            "Respond in a casual, human tone with practical tips about workspace setup, posture, or stretches. "
            "Keep it short, relatable, and conversational, like you're talking to a friend. "
            "If the question is a greeting (e.g., 'hello', 'hi'), greet back warmly and offer help with ergonomics. "
            "If it's vague or a follow-up (e.g., 'okey', 'yes', 'yup'), assume it relates to the last ergonomic topic and expand on it—or suggest something useful if there's no context. "
            "If it's clearly off-topic (e.g., math, random numbers), apologize naturally and steer back to ergonomics with a suggestion. "
            "When explaining postures or exercises, mention that you can show visual guides if they'd like to see them. "
            "Don't repeat yourself—keep each response fresh and unique.\n\n"
            f"{context_prompt}Current question: {question}"
        )

        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?"

        # Update context if it's ergonomics-related (basic check)
        ergo_keywords = ["desk", "chair", "posture", "stretch", "workspace", "sitting", "standing", "walking", 
                        "neck", "back", "exercise", "shoulder", "wrist", "ergonomic", "setup", "position", 
                        "move", "movement", "adjust", "comfort"]
        if any(keyword in question for keyword in ergo_keywords):
            last_question[username] = question
        else:
            last_question[username] = None

        # If user is requesting images, add image URLs to the response
        if image_request:
            # Dictionary of ergonomic images with descriptions
            ergo_images = {
                "posture": {
                    "url": "https://www.ergonomics.com.au/wp-content/uploads/2019/11/ergonomic-poster.jpg",
                    "caption": "Proper sitting posture with back support and feet flat on the floor"
                },
                "desk_setup": {
                    "url": "https://www.ergonomics.com.au/wp-content/uploads/2019/11/ergonomic-desk-setup.jpg",
                    "caption": "Ideal desk setup with monitor at eye level and keyboard at elbow height"
                },
                "wrist_position": {
                    "url": "https://www.ergonomics.com.au/wp-content/uploads/2019/11/ergonomic-wrist-position.jpg",
                    "caption": "Correct wrist position when typing to prevent carpal tunnel syndrome"
                },
                "monitor_height": {
                    "url": "https://www.ergonomics.com.au/wp-content/uploads/2019/11/ergonomic-monitor-height.jpg",
                    "caption": "Proper monitor height to prevent neck strain"
                },
                "chair_adjustment": {
                    "url": "https://www.ergonomics.com.au/wp-content/uploads/2019/11/ergonomic-chair-adjustment.jpg",
                    "caption": "How to adjust your office chair for optimal comfort and support"
                },
                "stretches": {
                    "url": "https://www.ergonomics.com.au/wp-content/uploads/2019/11/ergonomic-stretches.jpg",
                    "caption": "Simple stretches you can do at your desk to prevent muscle tension"
                }
            }
            
            # Determine which image to show based on the question
            image_key = None
            if "posture" in question or "sitting" in question or "back" in question:
                image_key = "posture"
            elif "desk" in question or "setup" in question or "workspace" in question:
                image_key = "desk_setup"
            elif "wrist" in question or "hand" in question or "typing" in question:
                image_key = "wrist_position"
            elif "monitor" in question or "screen" in question or "eye" in question:
                image_key = "monitor_height"
            elif "chair" in question or "seat" in question:
                image_key = "chair_adjustment"
            elif "stretch" in question or "exercise" in question or "movement" in question:
                image_key = "stretches"
            else:
                # Default to posture if no specific match
                image_key = "posture"
            
            # Add image information to the response
            image_info = ergo_images.get(image_key, ergo_images["posture"])
            return {
                "text": response.text.strip(),
                "image_url": image_info["url"],
                "image_caption": image_info["caption"]
            }
        
        # Return just the text response if no image is requested
        return {
            "text": response.text.strip(),
            "image_url": None,
            "image_caption": None
        }

    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return {
            "text": "I apologize, but I'm having trouble processing your request. Could you please try again?",
            "image_url": None,
            "image_caption": None
        }

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
    
    try:
        data = request.get_json()
        if not data or "question" not in data:
            return jsonify({"error": "Please send a question"}), 400
        
        question = data["question"]
        if not question.strip():
            return jsonify({"error": "Please enter a valid question"}), 400
        
        response_data = get_ergo_response(question, session['username'])
        
        # Return the response with image data if available
        return jsonify({
            "response": response_data["text"],
            "image_url": response_data["image_url"],
            "image_caption": response_data["image_caption"]
        })
    
    except Exception as e:
        print(f"Error in /ask endpoint: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)