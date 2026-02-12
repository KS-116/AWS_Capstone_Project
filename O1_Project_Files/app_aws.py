import boto3
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from functools import wraps
from groq import Groq

app = Flask(__name__)
app.secret_key = "career_counselor_secret_key"

# --- 1. AWS CLOUD CONFIGURATION ---
# Removed LocalStack endpoint and hardcoded keys
# Boto3 will automatically use the permissions from 'custom_user_role'
REGION_NAME = "us-east-1" # Ensure this matches your EC2 region

dynamodb = boto3.resource('dynamodb', region_name=REGION_NAME)
users_table = dynamodb.Table('Users')

# Initialize SNS Client for Requirement #3
sns_client = boto3.client('sns', region_name=REGION_NAME)
SNS_TOPIC_ARN = "arn:aws:sns:us-east-1:366256583005:CarrerNotifications"

GROQ_CLIENT = Groq(api_key="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")

# --- 2. UTILS ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('is_admin'):
            flash("Unauthorized Access", "danger")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def get_user_data(username):
    try:
        response = users_table.get_item(Key={'username': username})
        return response.get('Item', {})
    except Exception as e:
        print(f"DynamoDB Error: {e}")
        return {}

# NEW: SNS Alert function
def send_sns_notification(username, action):
    try:
        message = f"User {username} has performed: {action}"
        sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Message=message,
            Subject="Career Counselor System Alert"
        )
    except Exception as e:
        print(f"SNS Error: {e}")

# --- 3. ROUTES ---

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        role = request.form.get('role')
        try:
            users_table.put_item(
                Item={
                    'username': username, 
                    'password': password,
                    'role': role,
                    'is_admin': True if role == 'admin' else False
                },
                ConditionExpression='attribute_not_exists(username)'
            )
            # Notify admin of new registration
            send_sns_notification(username, f"Registered as {role}")
            flash(f"{role.capitalize()} account created!", "success")
            return redirect(url_for('login'))
        except:
            flash("Username already exists.", "danger")
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        role_selection = request.form.get('role')
        
        user = get_user_data(username)
        if user and user.get('password') == password:
            if user.get('role') == role_selection:
                session.update({
                    'username': username, 
                    'is_admin': user.get('is_admin', False)
                })
                if user.get('is_admin'):
                    return redirect(url_for('admin_dashboard'))
                return redirect(url_for('home'))
            else:
                flash(f"This account is not registered as a {role_selection}.", "danger")
        else:
            flash("Invalid username or password.", "danger")
    return render_template('login.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/home')
@login_required
def home():
    user = get_user_data(session['username'])
    return render_template('home.html', user=user)

@app.route('/setup-goal', methods=['GET', 'POST'])
@login_required
def setup_goal():
    username = session['username']
    if request.method == 'POST':
        data = {
            'college': request.form.get('college'),
            'education': request.form.get('education'),
            'cgpa': request.form.get('cgpa'),
            'skills': request.form.get('skills'),
            'target_goal': request.form.get('target_goal')
        }
        users_table.update_item(
            Key={'username': username},
            UpdateExpression="set college=:c, education=:e, cgpa=:cg, skills=:s, target_goal=:t",
            ExpressionAttributeValues={
                ':c': data['college'], ':e': data['education'], ':cg': data['cgpa'], 
                ':s': data['skills'], ':t': data['target_goal']
            }
        )
        # Notify of goal update
        send_sns_notification(username, f"Updated target to {data['target_goal']}")
        return redirect(url_for('dashboard'))
    return render_template('setup_goal.html', user=get_user_data(username))

@app.route('/dashboard')
@login_required
def dashboard():
    user = get_user_data(session['username'])
    target = user.get('target_goal', 'Data Analyst')
    current_skills = user.get('skills', 'Basic Computer Skills')

    prompt = (
        f"Act as a technical career analyst. A student wants to become a {target} "
        f"and currently knows: {current_skills}. "
        "Analyze the industry gap for 2026. Provide exactly 3 skills they already HAVE (Matched) "
        "and 3 critical skills they are MISSING. "
        "Format your entire response exactly like this: "
        "MATCHED: skill1, skill2, skill3 | MISSING: skill4, skill5, skill6"
    )

    try:
        completion = GROQ_CLIENT.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        ai_output = completion.choices[0].message.content
        parts = ai_output.split('|')
        matching_skills = [s.strip() for s in parts[0].replace('MATCHED:', '').split(',')]
        missing_skills = [s.strip() for s in parts[1].replace('MISSING:', '').split(',')]
    except Exception as e:
        matching_skills = ["Check Profile"]
        missing_skills = ["AI Sync Failed"]

    return render_template('dashboard.html', 
                            user=user, 
                            matching_skills=matching_skills, 
                            missing_skills=missing_skills)

@app.route('/generate-roadmap', methods=['POST'])
@login_required
def generate_roadmap():
    username = session['username']
    u = get_user_data(username)
    prompt = (
        f"Act as an elite Career Architect. Create a 4-phase roadmap for a student at {u.get('college')} "
        f"targeting a {u.get('target_goal')} role. Current skills: {u.get('skills')}. "
        "Format your response as exactly 4 sections. Each section must start with 'PHASE X:' "
        "followed by a short title and 2 bullet points for actions."
    )

    try:
        completion = GROQ_CLIENT.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        roadmap_content = completion.choices[0].message.content
        users_table.update_item(
            Key={'username': username},
            UpdateExpression="set roadmap_text = :r",
            ExpressionAttributeValues={':r': roadmap_content}
        )
        return jsonify({"success": True, "roadmap": roadmap_content})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
@login_required
def chat():
    user_query = request.json.get('message')
    u = get_user_data(session['username'])
    system_prompt = f"You are a counselor for a student at {u.get('college')}. Short answers only."
    completion = GROQ_CLIENT.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_query}]
    )
    return jsonify({"response": completion.choices[0].message.content})

@app.route('/admin-dashboard')
@admin_required
def admin_dashboard():
    response = users_table.scan()
    all_users = response.get('Items', [])
    return render_template('admin_dashboard.html', 
                           all_users=all_users, 
                           user_count=len(all_users))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)