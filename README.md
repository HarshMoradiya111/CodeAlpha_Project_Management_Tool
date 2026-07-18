# CodeAlpha_Project_Management_Tool

Full stack internship project for CodeAlpha.

## Repo layout
- `backend/` - Express + MongoDB API
- `frontend/` - React + Vite client

## Setup
Backend:
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env`
4. Fill in MongoDB and JWT values
5. Run `npm start`

Frontend:
1. `cd frontend`
2. `npm install`
3. Optionally set `VITE_API_BASE_URL`
4. Run `npm run dev`

## Environment variables
Backend:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

Frontend:
- `VITE_API_BASE_URL`

## Current backend features
- Auth: register and login with bcrypt and JWT
- Projects: create, list, fetch details, and invite members by email
- Tasks: create, update, delete, and comment on cards
- Real-time Socket.io room updates for task changes and comments

## Current frontend features
- Project list and project creation
- Kanban board with drag-and-drop between columns
- Task detail modal with comments
- Invite member form on each board
- Login and registration screens
- Socket.io live sync between open clients

## API summary
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects/:id/invite`
- `POST /api/projects/:id/tasks`
- `GET /api/tasks/project/:projectId`
- `GET /api/tasks/:id/comments`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/comments`

## GitHub repository name
Use this exact repo name:

`CodeAlpha_Project_Management_Tool`

## Push flow
If you are setting up the repo yourself, use:

```bash
git init
git add .
git commit -m "Initial CodeAlpha Project Management Tool scaffold"
git branch -M main
git remote add origin https://github.com/<your-username>/CodeAlpha_Project_Management_Tool.git
git push -u origin main
```

## Submission checklist
1. Push source code to `CodeAlpha_Project_Management_Tool`.
2. Record a demo showing project creation, invite flow, task moves, and comments.
3. Post on LinkedIn tagging `@CodeAlpha` with the repo link.
4. Submit through the WhatsApp form.
5. Keep at least 2 to 3 completed tasks for certificate eligibility.

## Notes
- Socket.io powers live updates in open browsers.
- For testing, open the board in two windows and move tasks between columns.
