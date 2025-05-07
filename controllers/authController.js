const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Organization = require('../models/Organization');
const Admin = require('../models/Admin');

// @desc    Inscription d'un administrateur
// @route   POST /api/auth/register-admin
// @access  Public
exports.registerAdmin = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    // Vérifier si un admin existe déjà
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Un administrateur avec cet email existe déjà' });
    }

    // Créer l'administrateur
    const admin = await Admin.create({
      nom,
      prenom,
      email,
      password,
      role: 'admin'
    });

    // Créer un token
    const token = admin.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription de l\'administrateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription de l\'administrateur',
      error: error.message
    });
  }
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password, role, ...additionalData } = req.body;

    // Vérifier si l'utilisateur existe déjà dans n'importe quel modèle
    const teacherExists = await Teacher.findOne({ email });
    const studentExists = await Student.findOne({ email });
    const organizationExists = await Organization.findOne({ email });
    const adminExists = await Admin.findOne({ email });
    
    if (teacherExists || studentExists || organizationExists || adminExists) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    let user;

    // Créer l'utilisateur en fonction du rôle
    switch (role) {
      case 'enseignant':
        user = await Teacher.create({
          nom,
          prenom,
          email,
          password,
          role,
          ...additionalData
        });
        break;
      case 'etudiant':
        user = await Student.create({
          nom,
          prenom,
          email,
          password,
          role,
          ...additionalData
        });
        break;
      case 'organisation':
        user = await Organization.create({
          nom,
          prenom,
          email,
          password,
          role,
          ...additionalData
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Rôle invalide'
        });
    }

    // Créer un token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Valider les entrées
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Vérifier l'utilisateur dans tous les modèles
    let user = null;
    
    // Chercher dans le modèle Admin
    user = await Admin.findOne({ email }).select('+password');
    if (!user) {
      // Chercher dans le modèle Teacher
      user = await Teacher.findOne({ email }).select('+password');
    }
    if (!user) {
      // Chercher dans le modèle Student
      user = await Student.findOne({ email }).select('+password');
    }
    if (!user) {
      // Chercher dans le modèle Organization
      user = await Organization.findOne({ email }).select('+password');
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si le mot de passe correspond
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Créer un token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// @desc    Obtenir l'utilisateur actuellement connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    let user;
    switch (req.user.role) {
      case 'admin':
        user = await Admin.findById(req.user.id);
        break;
      case 'enseignant':
        user = await Teacher.findById(req.user.id);
        break;
      case 'etudiant':
        user = await Student.findById(req.user.id);
        break;
      case 'organisation':
        user = await Organization.findById(req.user.id);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Rôle invalide'
        });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};