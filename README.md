🛒 VoiceCart – Voice-First E-Commerce for Seniors

VoiceCart is a voice-enabled e-commerce platform designed to help senior citizens shop online easily and independently.
The platform focuses on voice navigation, accessibility, and simplicity, making online shopping comfortable for elderly users.

🌟 Features

🎤 Voice Navigation – Browse, search, and shop using voice commands

🛍️ Product Catalog – Health, nutrition, and essential products

🛒 Cart & Checkout – Simple and guided shopping flow

🔊 Text-to-Speech – Automatic narration of pages

🔐 Secure Login – Token-based authentication

📱 Responsive UI – Works on desktop and mobile

🏗️ Tech Stack
Frontend

React

Web Speech API

HTML, CSS, JavaScript

Backend

Django

Django REST Framework

SQLite

📁 Project Structure
voicecart/
├── frontend/        # React frontend
├── backend/         # Django backend
├── docs/            # Documentation (optional)
├── LICENSE
└── README.md

⚙️ Installation
Backend Setup
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Frontend Setup
cd frontend
npm install
npm start

🎤 Example Voice Commands

“go to home”

“search for vitamins”

“add to cart”

“show cart”

“checkout now”

🧪 Testing

Backend tests: python manage.py test

Frontend tests: npm test

Voice testing: Use browser microphone and console logs

🔒 Security

Token-based authentication

Encrypted passwords

Server-side validation

🤝 Contributing

Fork the repository

Create a new branch

🛒 VoiceCart – Setup Guide

This guide explains how to set up and run VoiceCart locally for development and testing.

📌 Prerequisites

Make sure the following are installed on your system:

Node.js v16+

npm (comes with Node.js)

Python v3.8+

pip

Git

Modern browser (Chrome / Edge recommended for voice features)

ℹ️ Redis and payment gateways are optional for local development.

🧩 Project Overview

VoiceCart has two main parts:

Frontend – React app with voice control using Web Speech API

Backend – Django REST API for products, cart, orders, and authentication

🚀 Quick Start (Development)
1️⃣ Clone the Repository
git clone https://github.com/yourusername/voicecart.git
cd voicecart

🔧 Backend Setup (Django)
Step 1: Create Virtual Environment
cd backend
python -m venv venv

# Activate
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

Step 2: Install Dependencies
pip install -r requirements.txt

Step 3: Database Setup
python manage.py makemigrations
python manage.py migrate

Step 4: Create Admin User
python manage.py createsuperuser

Step 5: (Optional) Load Sample Data
python manage.py loaddata sample_data.json

Step 6: Run Backend Server
python manage.py runserver


✅ Backend will run at:
http://localhost:8000

Admin panel:
http://localhost:8000/admin

🎨 Frontend Setup (React)
Step 1: Navigate to Frontend
cd ../frontend

Step 2: Install Dependencies
npm install

Step 3: Configure Environment Variables

Create a file named .env inside the frontend folder:

REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_VOICE_ENABLED=true

Step 4: Start Frontend Server
npm start


✅ Frontend will run at:
http://localhost:3000

🎤 Testing Voice Features

Open Chrome or Edge

Allow microphone permission

Click the microphone button (🎤)

Try commands like:

“Search for vitamins”

“Go to health category”

“Add to cart”

“Show cart”

“Checkout now”

🔑 Important Notes

Voice features work best on Chrome / Edge

HTTPS is required for voice features in production

Firefox has limited Web Speech API support

🧪 Testing
Backend Tests
cd backend
python manage.py test

Frontend Tests
cd frontend
npm test

⚠️ Common Issues & Fixes
Voice Not Working

Check microphone permission

Use Chrome / Edge

Refresh the page

API Not Connecting

Ensure backend is running

Check REACT_APP_API_URL

Verify CORS settings

Database Errors
python manage.py migrate

🚀 Production Notes (Brief)

Set DEBUG=False in Django

Use PostgreSQL instead of SQLite

Enable HTTPS (required for voice)

Build frontend using:

npm run build

Commit your changes

Open a Pull Request
