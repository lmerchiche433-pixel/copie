process.on('uncaughtException', (err) => {
  console.error('ERREUR:', err.message);
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();        // ← EN PREMIER
require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const authRoutes        = require('./routes/auth');
const logementRoutes    = require('./routes/logements');
const reservationRoutes = require('./routes/reservations');
const dashboardRoutes   = require('./routes/dashboard');
const messagesRoutes    = require('./routes/messages');
const annonceRoutes     = require('./routes/creerAnnonce');  // ← ICI APRÈS

app.use('/api/auth',         authRoutes);
app.use('/api/logements',    logementRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/messages',     messagesRoutes);
app.use('/api/annonces',     annonceRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Algbnb fonctionne ✅' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});