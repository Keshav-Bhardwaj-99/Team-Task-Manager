# Team Task Manager

This is a simple application to manage team projects and tasks. It helps admins and team members to work together in one place.

### Key Features:
- **Login and Signup:** You can create an account as an Admin or a Team Member.
- **Projects:** Admins can create new projects for the team.
- **Tasks:** Admins can assign tasks to any team member.
- **Chat:** There is a small chat box for every task to discuss work.
- **Status Tracking:** Members can say when they finish work, and Admins can double-check it.
- **Dashboard:** A simple and clean dashboard to see total projects and task progress.

### How to Setup:

**1. Backend (FastAPI):**
- Open the main project folder.
- Install the required libraries using: `pip install -r requirements.txt`.
- Run the server using: `uvicorn main:app --reload`.
- The backend will be active at `http://127.0.0.1:8000`.

**2. Frontend (React):**
- Go inside the `frontend` folder.
- Run `npm install` to get everything ready.
- Start the application using: `npm run dev`.
- You can see the app at `http://localhost:5173`.

### Tech Stack:
- **Backend:** FastAPI (Python)
- **Frontend:** React (Vite)
- **Database:** PostgreSQL
- **Design:** Simple CSS and Icons
