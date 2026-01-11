# Quiz Application

A full-stack MERN (MongoDB, Express, React, Node.js) quiz application that allows users to sign up, take quizzes with questions fetched from the Open Trivia Database, and view detailed reports of their performance.

## Features

- **User Authentication**: Secure Login and Signup functionality using JWT.
- **Dynamic Quizzes**: Fetches random questions from the OpenTDB API.
- **Timed Sessions**: 30-minute countdown timer for each quiz.
- **Interactive Interface**: 
  - Navigate between questions.
  - Track visited and answered questions.
  - Real-time answer saving.
- **Detailed Reports**: 
  - View score and time taken.
  - Review answers with correct/incorrect indicators.
  - Historical data of past quizzes on the dashboard.
- **Responsive Design**: Modern UI that works on desktop and mobile.

## Tech Stack

- **Frontend**: React, Vite, React Router, Axios, CSS Modules.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Axios.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas connection string)

## Installation & Local Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Quiz2
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    - Create a `.env` file in the `backend` directory:
      ```env
      PORT=3000
      MONGODB_URI=mongodb://localhost:27017/quizapp  # Or your MongoDB Atlas URI
      JWT_SECRET=your_jwt_secret_key
      ```
    - Start the backend server:
      ```bash
      npm run dev
      ```

3.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    ```
    - Start the frontend development server:
      ```bash
      npm run dev
      ```

4.  **Access the App**
    - Open your browser and navigate to `http://localhost:5173`.

## Deployment

### Deploying to Vercel (Frontend)

1.  Push your code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com) and import your project.
3.  Set the **Root Directory** to `frontend`.
4.  Vercel should automatically detect Vite.
5.  **Environment Variables**:
    - If your backend is deployed, set `VITE_API_URL` to your backend URL.
    - *Note*: You might need to update `frontend/src/api.js` to use `import.meta.env.VITE_API_URL` instead of hardcoded localhost if you haven't already.

### Deploying Backend (Render/Heroku/Vercel)

1.  **Render/Heroku**: Connect your repo and set the Root Directory to `backend`. Set environment variables (`MONGODB_URI`, `JWT_SECRET`).
2.  **Vercel**: You can deploy Express apps to Vercel as Serverless functions. You would need to add a `vercel.json` configuration in the `backend` folder.

## Project Structure

```
Quiz2/
├── backend/            # Express Server & API Routes
│   ├── models/         # Mongoose Models (User, Quiz)
│   ├── routes/         # API Endpoints (Auth, Quiz)
│   ├── middleware/     # Auth Middleware
│   └── server.js       # Entry point
├── frontend/           # React Client
│   ├── src/
│   │   ├── context/    # Auth Context
│   │   ├── pages/      # Dashboard, Quiz, Login, Report
│   │   └── api.js      # Axios instance
└── README.md
```

## License

This project is for educational purposes.
