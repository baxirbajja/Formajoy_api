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
// Configuration CORS améliorée pour résoudre les problèmes d'en-têtes manquants
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://formajoy.vercel.app',
      'https://formajoy-git-main-formajoy.vercel.app',
      'https://formajoyapi-production.up.railway.app',
      'https://formajoy.netlify.app',
      'https://formajoy-app.netlify.app',
      // Autoriser tous les sous-domaines de vercel.app
      /\.vercel\.app$/,
      // Autoriser tous les sous-domaines de netlify.app
      /\.netlify\.app$/
    ]
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000'
    ];

// Configuration du middleware CORS avec options
app.use(cors({
  origin: function(origin, callback) {
    // Permettre les requêtes sans origine (comme les appels API mobiles ou Postman)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine correspond à l'une des origines autorisées
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      // Si c'est une expression régulière
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`Origine refusée par CORS: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
  maxAge: 86400
}));

// Middleware pour gérer les requêtes OPTIONS préliminaires
 app.options('*', (req, res) => {
  const origin = req.header('Origin');
  // Vérifier si l'origine est autorisée
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    if (typeof allowedOrigin === 'string') {
      return allowedOrigin === origin;
    }
    // Si c'est une expression régulière
    if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    }
    return false;
  });
  
  // Définir l'en-tête Access-Control-Allow-Origin avec l'origine spécifique si elle est autorisée
  if (isAllowed && origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.status(204).end();
});

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
