from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
import os
import json
import boto3
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__)
app.secret_key = 'career_counselor_2026_secure_key'

# Configuration for File Uploads
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------------------------------------------------
# 1. AWS BEDROCK SETUP
# ---------------------------------------------------------
# Ensure your AWS credentials are set up via AWS Educate/IAM
bedrock = boto3.client(service_name='bedrock-runtime', region_name='us-east-1')

def get_counselor_response(user_message, career_goal="General"):
    """Connects to Amazon Bedrock for AI Career Advice"""
    system_prompt = f"You are a professional AI Career Counselor. Help the user achieve their goal of becoming a {career_goal}."
    
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 800,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_message}]
    })

    try:
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-haiku-20240307-v1:0", 
            body=body
        )
        return json.loads(response.get('body').read())['content'][0]['text']
    except Exception as e:
        return f"AI Connection Error: {str(e)}"

# ---------------------------------------------------------
# 2. DATA STORAGE (In-Memory for MVP)
# ---------------------------------------------------------
users = {} # Stores {username: hashed_password}
admin_users = {"admin": generate_password_hash("admin123")}
projects = []  
enrollments = {} 

# ---------------------------------------------------------
# 3. HELPERS & DECORATORS
# ---------------------------------------------------------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            flash("Please log in first.", "error")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# ---------------------------------------------------------
# 4. USER ROUTES
# ---------------------------------------------------------

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users:
            flash("User already exists!", "error")
        else:
            users[username] = generate_password_hash(password)
            flash("Account created! Please login.", "success")
            return redirect(url_for('login'))
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users and check_password_hash(users[username], password):
            session['username'] = username
            return redirect(url_for('home'))
        flash("Invalid credentials!", "error")
    return render_template('login.html')

@app.route('/home')
@login_required
def home():
    username = session['username']
    user_enrollments_ids = enrollments.get(username, [])
    my_projects = [p for p in projects if p['id'] in user_enrollments_ids]
    return render_template('home.html', username=username, my_projects=my_projects)

# ---------------------------------------------------------
# 5. AI CHATBOT ROUTE
# ---------------------------------------------------------
@app.route('/api/chat', methods=['POST'])
@login_required
def chat():
    data = request.json
    user_msg = data.get('message')
    goal = data.get('goal', 'General')
    ai_reply = get_counselor_response(user_msg, goal)
    return jsonify({"response": ai_reply})

# ---------------------------------------------------------
# 6. ADMIN & PROJECT ROUTES
# ---------------------------------------------------------

@app.route('/admin/dashboard')
def admin_dashboard():
    if 'admin' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin_dashboard.html', username=session['admin'], projects=projects)

@app.route('/admin/create-project', methods=['GET', 'POST'])
def admin_create_project():
    if 'admin' not in session: return redirect(url_for('admin_login'))
    if request.method == 'POST':
        # Same logic as your sample but improved ID handling
        project_id = len(projects) + 1
        new_project = {
            'id': project_id,
            'title': request.form['title'],
            'problem_statement': request.form['problem_statement'],
            'solution_overview': request.form['solution_overview'],
            'image': secure_filename(request.files['image'].filename) if request.files['image'] else None
        }
        projects.append(new_project)
        return redirect(url_for('admin_dashboard'))
    return render_template('admin_create_project.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)