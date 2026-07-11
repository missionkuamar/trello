📋 TaskFlow - Complete Task Management System
A full-featured task management application built with the MERN stack, featuring Trello-style boards, role-based access control, and real-time collaboration.

✨ Features
🎯 Core Features
Trello-Style Kanban Board - Drag & drop task management

Role-Based Access Control - Admin, Moderator, and User roles

Task Management - Create, read, update, delete tasks

Board Management - Create multiple boards with custom columns

User Management - Admin/Moderator can manage users

Task Assignment - Assign tasks to team members

Comments & Attachments - Collaborate on tasks

Search & Filter - Find tasks quickly

Activity Tracking - Monitor task progress

👥 Role-Based Permissions
Feature	User	Moderator	Admin
View own tasks	✅	✅	✅
View all tasks	❌	✅	✅
Create tasks	✅	✅	✅
Edit own tasks	✅	✅	✅
Edit all tasks	❌	✅	✅
Delete tasks	❌	❌	✅
Assign tasks	❌	✅	✅
Manage users	❌	❌	✅
View user list	❌	✅	✅
Manage boards	✅	✅	✅
🚀 Tech Stack
Frontend
React 18 - UI Framework

Redux Toolkit - State Management

React Router v6 - Routing

Tailwind CSS - Styling

React DnD - Drag & Drop

Axios - API Calls

React Hot Toast - Notifications

Backend
Node.js - Runtime

Express - Web Framework

MongoDB - Database

Mongoose - ODM

JWT - Authentication

Cloudinary - Image/File Upload

Multer - File Handling

📦 Installation
Prerequisites
Node.js (v16 or higher)

MongoDB (local or Atlas)

npm or yarn

Clone the Repository
bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
Backend Setup
bash
# Navigate to server
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your values
# MONGODB_URI, JWT_SECRET, CLOUDINARY_*, etc.

# Start development server
npm run dev
Frontend Setup
bash
# Navigate to client
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your API URL
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
Environment Variables
Server .env

env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development
Client .env

env
VITE_API_URL=http://localhost:5000/api
🏗️ Project Structure
text
taskflow/
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   └── Board.js
│   ├── middleware/
│   │   └── auth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   └── boardController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   └── boardRoutes.js
│   ├── .env
│   └── server.js
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── auth.js
│   │   │   ├── tasks.js
│   │   │   └── board.js
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   ├── board/
│   │   │   └── dashboard/
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   ├── Moderator/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Board.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── TaskDetail.jsx
│   │   │   ├── CreateTask.jsx
│   │   │   ├── EditTask.jsx
│   │   │   └── Profile.jsx
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   ├── hooks.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── taskSlice.js
│   │   │       ├── boardSlice.js
│   │   │       └── uiSlice.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useTask.js
│   │   │   └── useBoard.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── package.json
└── README.md
🔐 API Routes
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user
GET	/api/auth/me	Get current user
PUT	/api/auth/profile	Update profile
PUT	/api/auth/password	Change password
POST	/api/auth/avatar	Upload avatar
Tasks
Method	Endpoint	Description
GET	/api/tasks	Get all tasks
GET	/api/tasks/board	Get tasks by status
GET	/api/tasks/:id	Get single task
POST	/api/tasks	Create task
PUT	/api/tasks/:id	Update task
PUT	/api/tasks/position	Update task position
DELETE	/api/tasks/:id	Delete task
POST	/api/tasks/:id/comments	Add comment
POST	/api/tasks/:id/attachments	Upload attachment
Boards
Method	Endpoint	Description
GET	/api/boards	Get all boards
GET	/api/boards/:id	Get single board
POST	/api/boards	Create board
PUT	/api/boards/:id	Update board
DELETE	/api/boards/:id	Delete board
GET	/api/boards/:id/tasks	Get board tasks
POST	/api/boards/:id/members	Add member
DELETE	/api/boards/:id/members/:userId	Remove member
🎯 Usage Guide
Getting Started
Register/Sign Up

First user becomes Admin automatically

Subsequent users become regular users

Create a Board

Navigate to /board

Click "Create Board"

Add a name and description

Add Tasks

Open a board

Click "Add Task"

Fill in task details

Assign to a user

Drag & Drop

Drag tasks between columns

Tasks automatically update status

Manage Users (Admin/Moderator)

Admin: Full user management

Moderator: View and manage regular users

🛡️ Security Features
JWT Authentication

Password Hashing (bcrypt)

Role-Based Access Control

Protected Routes

Input Validation

XSS Protection

CORS Configuration

📱 Responsive Design
Fully responsive across all devices

Mobile-first approach

Optimized for tablets and phones

🚀 Deployment
Deploy Backend (Render)
bash
# Create render.yaml
services:
  - type: web
    name: taskflow-api
    runtime: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
Deploy Frontend (Vercel)
bash
cd client
npm run build
vercel --prod
🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License.

🙏 Acknowledgments
React DnD for drag & drop functionality

Tailwind CSS for styling

Cloudinary for file hosting

All open-source contributors

📞 Support
For support, email support@taskflow.com or create an issue in the repository.

Made with ❤️ by Mission Kumar