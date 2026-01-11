# 🎓 Quiz Application

A full-stack **MERN** (MongoDB, Express, React, Node.js) quiz application designed to test your knowledge with dynamic questions fetched from the Open Trivia Database. It features secure user authentication, timed quiz sessions, and detailed performance reports.

### Live Vercel Link : https://quizcausalfunnel.vercel.app/login
Also the backend is deployed on render with the required env variables.
## ✨ Features

- **🔐 User Authentication**: Secure Login and Signup using JWT (JSON Web Tokens).
- **🎲 Dynamic Quizzes**: Fetches 15 random questions from the OpenTDB API for every session.
- **⏱️ Timed Sessions**: 30-minute countdown timer with auto-submission.
- **📱 Interactive Interface**:
  - Grid navigation for questions.
  - Visual indicators for visited, answered, and current questions.
  - Real-time answer saving (prevents data loss on refresh).
- **📊 Detailed Analytics**:
  - Instant score calculation.
  - Question-by-question breakdown with correct answers.
  - Dashboard history of all previous attempts.
- **🎨 Modern UI**: Responsive design with a clean, dark-themed aesthetic.

## 🛠️ Tech Stack

### Frontend
- **React**: UI Library
- **Vite**: Build Tool
- **React Router**: Navigation
- **Axios**: API Requests
- **CSS Modules**: Styling

### Backend
- **Node.js & Express**: Server & API
- **MongoDB & Mongoose**: Database & ODM
- **JWT**: Authentication
- **BcryptJS**: Password Hashing

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14+)
- **MongoDB** (Local instance or Atlas URI)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Quiz2
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```

Start the server:
```bash
npm run dev
```
*The backend runs on `http://localhost:3000`*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies:
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```
*The frontend runs on `http://localhost:5173`*

## 🌍 Deployment

### Deploying to Vercel

This project is configured for easy deployment on Vercel.

#### **Backend Deployment**
1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Set the **Root Directory** to `backend`.
4.  Add Environment Variables: `MONGODB_URI` and `JWT_SECRET`.
5.  Deploy!

#### **Frontend Deployment**
1.  Import the **same** repository in Vercel (create a new project).
2.  Set the **Root Directory** to `frontend`.
3.  Vercel will auto-detect Vite.
4.  Add Environment Variable:
    - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://your-backend.vercel.app/api`).
5.  Deploy!

## 📂 Project Structure

```
Quiz2/
├── backend/
│   ├── middleware/   # Auth protection
│   ├── models/       # User & Quiz Schemas
│   ├── routes/       # Auth & Quiz Endpoints
│   ├── server.js     # App Entry Point
│   └── vercel.json   # Vercel Config
├── frontend/
│   ├── src/
│   │   ├── context/  # Auth State Management
│   │   ├── pages/    # Login, Signup, Dashboard, Quiz, Report
│   │   ├── api.js    # Axios Configuration
│   │   ├── App.jsx   # Routing Logic
│   │   └── main.jsx  # React Entry
│   └── vite.config.js
└── README.md
```

## 📝 License

This project is created for educational purposes.
