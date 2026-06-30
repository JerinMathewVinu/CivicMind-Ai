# 🏙️ CivicMind AI

> **AI That Doesn't Just Report Problems—It Helps Cities Solve Them.**

CivicMind AI is a production-grade Smart City Civic Intelligence Platform. Citizens
report civic issues; AI autonomously classifies, prioritizes, predicts, tracks,
verifies, and assists municipal authorities in resolving them.

## 🧱 Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui, Framer Motion |
| Backend | FastAPI, Python 3.12, Pydantic v2, Firebase Admin SDK |
| Database | Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| AI | Gemini 2.5 Flash (Vision + Text) |
| Maps | Leaflet.js / Custom Interactive Grid Map |

## 🚀 Quick Start
```bash
# Clone & navigate
cd civicmind-ai

# Start backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app/main.py

# Start frontend
cd ../frontend
npm install
npm run dev
```