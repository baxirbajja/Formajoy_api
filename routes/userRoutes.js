const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Import des modèles
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Organization = require('../models/Organization');
const Course = require('../models/Course');

// Route pour créer un nouvel utilisateur (accessible uniquement par l'admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, ...userData } = req.body;
    let user;

    switch (role) {
      case 'admin':
        user = await Admin.create(userData);
        break;
      case 'enseignant':
        user = await Teacher.create(userData);
        break;
      case 'etudiant':
        user = await Student.create(userData);
        break;
      case 'organisation':
        user = await Organization.create(userData);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Rôle invalide'
        });
    }

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Route pour obtenir tous les utilisateurs (accessible uniquement par l'admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const [admins, teachers, students, organizations] = await Promise.all([
      Admin.find(),
      Teacher.find(),
      Student.find(),
      Organization.find()
    ]);

    const users = [
      ...admins,
      ...teachers,
      ...students,
      ...organizations
    ];

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Route pour obtenir un utilisateur spécifique par ID
router.get('/:id', protect, async (req, res) => {
  try {
    let user = await Admin.findById(req.params.id);
    if (!user) user = await Teacher.findById(req.params.id);
    if (!user) user = await Student.findById(req.params.id);
    if (!user) user = await Organization.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Route pour mettre à jour un utilisateur
router.put('/:id', protect, async (req, res) => {
  try {
    let user;
    const { role } = req.body;

    switch (role) {
      case 'admin':
        user = await Admin.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });
        break;
      case 'enseignant':
        user = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });
        break;
      case 'etudiant':
        user = await Student.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });
        break;
      case 'organisation':
        user = await Organization.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Rôle invalide'
        });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Route pour obtenir les cours d'un utilisateur
router.get('/:id/courses', protect, async (req, res) => {
  try {
    let user = await Admin.findById(req.params.id);
    if (!user) user = await Teacher.findById(req.params.id);
    if (!user) user = await Student.findById(req.params.id);
    if (!user) user = await Organization.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si le rôle de l'utilisateur est valide pour accéder aux cours
    if (!['etudiant', 'enseignant'].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: `Le rôle ${user.role} n'est pas autorisé à accéder aux cours. Seuls les étudiants et les enseignants peuvent accéder aux cours.`
      });
    }

    let courses = [];
    if (user.role === 'etudiant') {
      const student = await Student.findOne({ user: user._id });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Profil étudiant non trouvé pour l'utilisateur ${user._id}. Veuillez contacter l'administrateur.`
        });
      }
      await student.populate('cours');
      courses = student.cours;
    } else if (user.role === 'enseignant') {
      const teacher = await Teacher.findOne({ user: user._id });
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: `Profil enseignant non trouvé pour l'utilisateur ${user._id}. Veuillez contacter l'administrateur.`
        });
      }
      await teacher.populate('cours');
      courses = teacher.cours;
    }

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours'
    });
  }
});

// Route pour supprimer un utilisateur (accessible uniquement par l'admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let user = await Admin.findByIdAndDelete(req.params.id);
    if (!user) user = await Teacher.findByIdAndDelete(req.params.id);
    if (!user) user = await Student.findByIdAndDelete(req.params.id);
    if (!user) user = await Organization.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;