# 🎓 Virtual Career Counselor (AWS Capstone Project)

Hi! This is my **AWS Capstone Project**. I built a Virtual Career Counselor that uses Cloud Computing and Artificial Intelligence to help students figure out their career paths. Instead of just giving generic advice, it builds a custom roadmap based on specific user goals and skills.

## 📺 See it in Action
I've recorded a full **9:35 minute** demo where I walk through the code, show the AWS console setup, and demonstrate the live app working. You can watch it here:

[**Watch the Project Demo on Google Drive**](https://drive.google.com/file/d/1lrXyCzKcRbUhs4qh9GSJSLVm9IrNJtjJ/view?usp=sharing)

---

## 📂 What's in this Repository?
I've organized the workspace so everything is easy to find for the project submission:

* **`AWS_Capstone_Project`**: This is the heart of the project. It contains the Flask backend (`app_aws.py`), all the HTML pages, and the CSS for the styling.
* **`Project Documentation`**: Here you'll find my full 50-page project report in PDF format. It covers everything from my initial research to the final testing results.
* **`Output Screenshots`**: I've included screenshots of the dashboard, the AI responses, and the database tables for a quick preview of the implementation.

---

## 💻 How I Built It (The Tech Stack)
I wanted to use industry-standard tools to make this project as robust as possible:

* **The Brain (AI):** I used the **Groq Cloud API (Llama-3.3-70b)**. It's incredibly fast at generating step-by-step career roadmaps based on user prompts.
* **The Database:** I chose **Amazon DynamoDB** (NoSQL) to store all user profiles and their generated roadmaps. It’s reliable and scales perfectly for web apps.
* **Notifications:** I integrated **AWS SNS** so the system can send instant email alerts to users when their career path has been successfully generated.
* **Hosting & Security:** The app is hosted on an **AWS EC2** instance. For security, I used **IAM Roles** so the application can communicate with DynamoDB and SNS securely without hardcoding any secret keys.
* **Backend Framework:** The entire logic is written in **Python** using the **Flask** web framework.

---

## 🚀 How to Run it Locally
1. Clone this repo to your machine.
2. Install the requirements: `pip install -r requirements.txt`.
3. Ensure your AWS environment is configured (or use an IAM role if running on EC2).
4. Launch the app: `python app_aws.py`.
5. Open `http://127.0.0.1:5000` in your browser!

---
*AWS Capstone Project - 2026*