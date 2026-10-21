// client/src/config.js

// Vite automatically sets import.meta.env.PROD to true when deployed on Vercel
export const API = import.meta.env.PROD 
  ? 'https://aidbridge-itsz.onrender.com' 
  : 'http://localhost:5000';