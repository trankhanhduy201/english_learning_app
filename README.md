# 📚 English Learning App

This is a full-stack web application designed to help users learn English through flashcards and categorized topics. It features a modern React frontend, a Django backend with RESTful APIs, and a Dockerized environment for development and deployment.

---

## 📁 Project Structure

```
.
├── backend/
│   ├── english_learning_app/     # Django backend app
│   ├── db.sqlite3                # SQLite database (ignored by Git)
│   ├── manage.py                 # Django management script
│   ├── requirements.txt          # Python dependencies
│   └── static/                   # Collected static files
├── frontend/
│   ├── english_flashcard_app/    # React frontend app
│   ├── package.json              # Node.js dependencies
│   ├── public/                   # Public assets
│   └── src/                      # React source code
├── docker-compose.yml            # Docker Compose config
├── api_dockerfile                # Dockerfile for the Django backend
├── web_dockerfile                # Dockerfile for the React frontend
├── nginx/                        # Nginx configuration
├── logs/                         # Logs for Nginx and supervisord
└── entrypoint.sh                 # Backend entrypoint script (runs migrations)
```

---

## 🚀 Features

### 🖥️ Frontend (React)
- Built with **React 19** and **Redux Toolkit**
- Manage profiles, topics, vocabularies and flashcards
- Responsive UI with **Bootstrap 5**
- Consumes REST APIs for dynamic content

### 🛠 Backend (Django)
- RESTful APIs using **Django + DRF**
- Handles flashcard and topic logic
- Uses **SQLite** for development

### ⚙️ DevOps (Dockerized)
- Full Docker support via `docker-compose`
- **Uvicorn** for serving Django
- **Nginx** as reverse proxy
- Redis integration planned (caching/pub-sub)

---

## 🧰 Tech Stack

| Layer      | Tools                                         |
|------------|-----------------------------------------------|
| Frontend   | React, Redux Toolkit, React Router, Bootstrap |
| Backend    | Django, Django REST Framework, SQLite         |
| Production | Docker, Docker Compose, Nginx, Uvicorn        |
| Optional   | Redis (future enhancement)                    |

---

## 🚀 Getting Started

### ✅ Prerequisites
- Docker
- Docker Compose

### 🏗️ Start the project

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Build and start all services:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)

4. Stop the containers:
   ```bash
   docker-compose down
   ```

---

## 📌 Notes

- The SQLite database file (`db.sqlite3`) is **ignored in Git** to prevent leaking sensitive data.
- The backend container automatically runs:
  - `makemigrations`
  - `migrate`
  - `collectstatic`
  during startup via `entrypoint.sh`.
- Static files are collected and stored in the `static/` directory.
- You can create a Django admin user by entering the backend container:
  ```bash
  docker exec -it <backend_container_name> python manage.py createsuperuser
  ```

---

## 🧑‍💻 Author

**Duy Tran**  
[GitHub Profile](https://github.com/trankhanhduy201)
