# React Blog Application 🚀

A modern, full-stack blogging platform built with a **React (Vite)** frontend and a **Python FastAPI** backend. It features user authentication, a rich post feed, interactive comments, and a comprehensive follower system.

<img src="./app_showcase.webp" alt="App Showcase" width="100%" />

## 🌟 Features

- **User Authentication:** Secure signup and login using JWT (JSON Web Tokens) and `bcrypt` password hashing.
- **Dynamic Post Feed:** Create, edit, read, and delete your own blog posts.
- **Interactive Comments:** Engage with other authors by commenting on their posts.
- **Follower System:** Follow your favorite authors. Features a dedicated popup modal for viewing Followers and Following lists.
- **Quick Follow:** Instantly follow/unfollow authors directly from the home feed or their profile page.
- **User Profiles:** View profile stats (total posts, followers, following) and edit your profile name inline.
- **Database Flexibility:** Defaults to a local SQLite database for quick setup, with out-of-the-box support for PostgreSQL (e.g., Supabase) for production.

## 🛠️ Technology Stack

**Frontend:**
- React (bootstrapped with Vite)
- React Router DOM (Routing)
- Lucide React (Icons)
- Context API (Global State Management)

**Backend:**
- Python 3.12
- FastAPI (High-performance web framework)
- SQLAlchemy (ORM)
- Pydantic (Data validation)
- PyJWT & bcrypt (Authentication and Security)
- Uvicorn (ASGI Server)

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v16+) & **npm**
- **Python 3.12+**
- **Make** (Usually pre-installed on Linux/macOS)

### 1. Installation

We have provided a unified Makefile to install dependencies for both the frontend and backend in one command. Run this in the root directory:

```bash
make install
```

*What this does:*
- Runs `npm install` to install React dependencies.
- Creates a Python virtual environment (`venv`).
- Installs backend requirements from `backend/requirements.txt`.

### 2. Database Configuration (Optional)

By default, the application uses a local SQLite database (`blog.db`). No configuration is needed!

**Using Supabase / PostgreSQL:**
If you want to use a cloud database like Supabase, create a `.env` file in the root directory and add your connection string:
```env
DATABASE_URL="postgresql://username:password@your-supabase-host:5432/postgres"
```

### 3. Run the Application

To start both the FastAPI backend and the React frontend simultaneously, run:

```bash
make run
```

- **Frontend:** http://localhost:5173
- **Backend API Docs:** http://localhost:8000/docs

## 📁 Project Structure

```
├── backend/
│   ├── main.py           # FastAPI application entry point
│   ├── models.py         # SQLAlchemy database models (User, Post, Comment, Followers)
│   ├── schemas.py        # Pydantic schemas for request/response validation
│   ├── database.py       # Database connection setup
│   ├── auth.py           # Authentication logic and JWT handling
│   └── requirements.txt  # Python dependencies
├── src/
│   ├── components/       # Reusable React components (Navbar, PostCard, UserListModal, etc.)
│   ├── context/          # React Context (AuthContext)
│   ├── pages/            # Page components (Home, Profile, Login, etc.)
│   ├── App.jsx           # Main React routing
│   └── api.js            # API utility for interacting with the FastAPI backend
├── index.css             # Global styling
└── Makefile              # Commands for easy setup and running
```
