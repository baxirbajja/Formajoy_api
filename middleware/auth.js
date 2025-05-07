const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Organization = require('../models/Organization');

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans les headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extraire le token du header Bearer
    token = req.headers.authorization.split(' ')[1];
  }

  // Vérifier si le token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé, veuillez vous connecter'
    });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Trouver l'utilisateur dans le modèle approprié selon son rôle
    let user;
    switch (decoded.role) {
      case 'admin':
        user = await Admin.findById(decoded.id);
        break;
      case 'enseignant':
        user = await Teacher.findById(decoded.id);
        break;
      case 'etudiant':
        user = await Student.findById(decoded.id);
        break;
      case 'organisation':
        user = await Organization.findById(decoded.id);
        break;
      default:
        throw new Error('Rôle invalide');
    }

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé, token invalide'
    });
  }
};

// Middleware pour restreindre l'accès en fonction du rôle
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`
      });
    }
    next();
  };
};