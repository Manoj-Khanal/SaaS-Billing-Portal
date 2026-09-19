# SaaS Billing Portal

Full-stack role-based SaaS billing portal using React + Vite, Node.js + Express, MongoDB + Mongoose and JWT.

## Backend
cd backend
npm install
copy .env.example .env
# edit .env with your MongoDB URI and JWT_SECRET
npm run dev

## Frontend
cd frontend
npm install
npm run dev

For a deployed backend, create frontend/.env with:
VITE_API_URL=https://YOUR-BACKEND.onrender.com

## Roles
Admin: view/create/edit/delete customers.
Employee: view customers/dashboard/billing but cannot modify customers.

Never commit .env. If a real MongoDB password was exposed, rotate it in MongoDB Atlas.
