const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const participantRoutes = require('./routes/participantRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


// Configuration des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Message de bienvenue pour tester l'API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API FormaJOY' });
});

// Montage des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/payments', paymentRoutes);


// Connexion à MongoDB
const connectDB = async () => {
  try {
    // Utiliser l'URL de MongoDB depuis les variables d'environnement ou une valeur par défaut
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/formajoy';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connexion à MongoDB établie avec succès');
  } catch (err) {
    console.error('Erreur de connexion à MongoDB:', err.message);
    // Arrêter le processus en cas d'échec de connexion
    process.exit(1);
  }
};

// Appel de la fonction de connexion
connectDB();

// Définition du port
const PORT = process.env.PORT || 5050;

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});