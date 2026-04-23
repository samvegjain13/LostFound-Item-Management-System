# Lost & Found Item Management System

A MERN stack web application for managing lost and found items on a college campus.

## Features
- User Registration & Login with JWT Authentication
- Report Lost/Found items with details
- View all reported items
- Search items by name
- Filter items by type (Lost/Found)
- Update/Delete own entries
- Secure Logout

## Tech Stack
- **Frontend**: React (Vite), Axios, React Router, React Toastify
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken), bcryptjs

## Project Structure
```
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js     # JWT auth middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Item.js           # Item schema
│   ├── routes/
│   │   ├── authRoutes.js     # Register & Login
│   │   └── itemRoutes.js     # Item CRUD + Search
│   ├── server.js             # Express server
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── api.js            # Axios API module
│   │   ├── App.jsx           # Routes
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Styles
│   └── index.html
└── README.md
```

## API Endpoints

### Auth APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register | Register new user |
| POST | /api/login | Login user |

### Item APIs (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | Get all items |
| GET | /api/items/:id | Get item by ID |
| POST | /api/items | Add new item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |
| GET | /api/items/search?name=xyz | Search items |
| GET | /api/dashboard | Protected dashboard |

## Setup & Run

### Backend
```bash
cd backend
npm install
# Create .env file with:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/lostfound
# JWT_SECRET=your_secret_key
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## MongoDB Schema

### User
- Name (String, required)
- Email (String, unique, required)
- Password (String, hashed, required)

### Item
- Item Name (String, required)
- Description (String, required)
- Type (Lost/Found, required)
- Location (String, required)
- Date (Date, required)
- Contact Info (String, required)
- User (ObjectId, ref: User)
