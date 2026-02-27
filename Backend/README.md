
# 🎬 Fullstack Video Application

A full-featured MERN stack video platform with secure authentication, video uploads, and post creation. Built for scalability, performance, and smooth user experience.

## 🚀 Features

### 🔐 Authentication & Authorization

* **User Registration & Login** with JWT-based authentication
* **Secure password hashing** using bcrypt
* **Role-based access control** (Admin & Normal Users)
* **Protected routes** for sensitive operations

### 📹 Video Management

* **Upload videos** with file validation
* **Cloud storage / local storage** support
* **Add thumbnails** for videos
* **Video streaming support** for fast playback

### 📝 Post & Content Management

* **Create posts** with video and description
* **Edit & delete posts** (only for the author or admin)
* **Like & comment system**
* **Search & filter videos** by title or tags

### 🛡 Admin Panel

* **View all users & videos**
* **Delete inappropriate content**
* **Manage platform data** efficiently
* **Special admin login credentials**

### 🎯 Extra Functionalities for Productivity

* **Responsive UI** for mobile & desktop
* **Optimized video loading** for better performance
* **Error handling & validation** for all forms
* **Efficient backend queries** for faster response times

---

## 🛠 Tech Stack

**Frontend:** React.js, Tailwind CSS, Axios, React Router
**Backend:** Node.js, Express.js, MongoDB, Mongoose
**Authentication:** JWT, bcrypt
**File Storage:** Multer (local) / Cloudinary (optional)
**Version Control:** Git, GitHub



## ⚡ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/video-app.git
cd video-app
```

### 2️⃣ Install dependencies

**Backend**

```bash
cd backend
npm install
```

**Frontend**

```bash
cd frontend
npm install
```

### 3️⃣ Add environment variables (`.env`) in the backend folder

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=5000
```

### 4️⃣ Start the application

**Backend**

```bash
cd backend
npm start
```

**Frontend**

```bash
cd frontend
npm run dev
```

---

## 📌 API Endpoints

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login user          |
| POST   | `/api/videos`        | Upload a video      |
| GET    | `/api/videos`        | Get all videos      |
| GET    | `/api/videos/:id`    | Get video by ID     |
| DELETE | `/api/videos/:id`    | Delete video        |
| POST   | `/api/posts`         | Create a post       |
| GET    | `/api/posts`         | Get all posts       |

---



---

