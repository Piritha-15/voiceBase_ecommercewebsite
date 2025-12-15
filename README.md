# 🛒 VoiceCart – Voice-First E-Commerce for Seniors

VoiceCart is a **voice-enabled e-commerce platform** designed to help **senior citizens shop online easily and independently**.  
The platform focuses on **voice navigation, accessibility, and simplicity**, making online shopping comfortable for elderly users.

---

## 🌟 Features

- 🎤 **Voice Navigation** – Browse, search, and shop using voice commands  
- 🛍️ **Product Catalog** – Health, nutrition, and essential products  
- 🛒 **Cart & Checkout** – Simple and guided shopping flow  
- 🔊 **Text-to-Speech** – Automatic narration of pages  
- 🔐 **Secure Login** – Token-based authentication  
- 📱 **Responsive UI** – Works on desktop and mobile  

---

## 🏗️ Tech Stack

### Frontend
- React  
- Web Speech API  
- HTML, CSS, JavaScript  

### Backend
- Django  
- Django REST Framework  
- SQLite  

---

## 📁 Project Structure

voicecart/
├── frontend/ # React frontend
├── backend/ # Django backend
├── docs/ # Documentation (optional)
├── LICENSE
└── README.md


---

## ⚙️ Installation

### Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Backend runs at:
👉 http://localhost:8000

Admin panel:
👉 http://localhost:8000/admin

Frontend Setup

cd frontend
npm install
npm start

Frontend runs at:
👉 http://localhost:3000

🎤 Example Voice Commands

“go to home”

“search for vitamins”

“add to cart”

“show cart”

“checkout now”
