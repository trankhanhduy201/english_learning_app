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
- Manage topics, vocabularies, flashcards, profile and settings...
- Responsive UI with **Bootstrap 5**
- Consumes REST APIs for dynamic content

### 🛠 Backend (Django)
- RESTful APIs using **Django + Django REST Framework (DRF)**
- Implements core logic for topics, vocabularies and user data
- Uses **SQLite** for development

### ⚙️ DevOps (Dockerized)
- Full Docker support via `docker-compose`
- **Uvicorn** for serving Django
- **Nginx** as reverse proxy
- **Redis (pub/sub)** for real time communication

---

## 🧰 Tech Stack

| Layer      | Tools                                         |
|------------|-----------------------------------------------|
| Frontend   | React, Redux Toolkit, React Router, Bootstrap |
| Backend    | Django, Django REST Framework, SQLite         |
| Production | Docker, Docker Compose, Nginx, Uvicorn        |
| Optional   | Redis                                         |

---

## 🚀 Getting Started

### ✅ Prerequisites
- Docker
- Docker Compose

### 🏗️ Start the project

1. Clone the repository:
   ```bash
   git clone https://github.com/trankhanhduy201/english_learning_app.git
   cd english_learning_app
   ```

2. Build and start all services:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:80](http://localhost:80)

4. Login application:
   - User: root
   - Password: root

5. Stop the containers:
   ```bash
   docker-compose down
   ```

---

## 📌 Notes

- The SQLite database file (`db.sqlite3`) is **ignored in Git** to prevent leaking sensitive data.
- The backend container automatically runs during startup via `entrypoint.sh`:
  - `makemigrations`
  - `migrate`
  - `createsuperuser`
- You can create a Django admin user manually by entering the backend container:
  ```bash
  docker exec -it <backend_container_name> python manage.py createsuperuser
  ```
- You can restart the supervisor service by running below command:
  ```bash
  docker exec <backend_container_name> supervisorctl restart all
  ```
---

## 🧑‍💻 Author

**Duy Tran**  
[GitHub Profile](https://github.com/trankhanhduy201)