# 💍 Wedding Planner

A full-stack Wedding Planning management application designed to organize, plan, and manage wedding events seamlessly.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React
- **Backend**: Golang (Gin Framework), SQLite / MySQL
- **Containerization**: Docker Compose

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Go (v1.22+)
- Docker & Docker Compose (optional)

### 1. Run Backend
```bash
cd backend
go run main.go
```
The API server will run at `http://localhost:8080`.

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
The web application will run at `http://localhost:5173`.

### 3. Run with Docker Compose
```bash
docker-compose up --build
```
