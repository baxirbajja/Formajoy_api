const Session = require('../models/Session');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');

// @desc    Obtenir toutes les sessions
// @route   GET /api/sessions
// @access  Private/Admin
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('cours', 'titre')
      .populate('enseignant', 'nom prenom');

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions',
      error: error.message
    });
  }
};

// @desc    Obtenir une session par ID
// @route   GET /api/sessions/:id
// @access  Private
exports.getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('cours', 'titre description')
      .populate('enseignant', 'nom prenom')
      .populate({
        path: 'presences',
        populate: [
          { path: 'etudiant', select: 'nom prenom' },
          { path: 'participant', select: 'nom prenom' }
        ]
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la session',
      error: error.message
    });
  }
};

// @desc    Créer une nouvelle session
// @route   POST /api/sessions
// @access  Private/Admin
exports.createSession = async (req, res) => {
  try {
    // Vérifier si le cours existe
    const course = await Course.findById(req.body.cours);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Vérifier si l'enseignant existe
    const teacher = await Teacher.findById(req.body.enseignant);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    const session = await Session.create(req.body);

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une session
// @route   PUT /api/sessions/:id
// @access  Private/Admin
exports.updateSession = async (req, res) => {
  try {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la session',
      error: error.message
    });
  }
};

// @desc    Supprimer une session
// @route   DELETE /api/sessions/:id
// @access  Private/Admin
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    await session.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la session',
      error: error.message
    });
  }
};

// @desc    Obtenir les sessions d'un cours
// @route   GET /api/sessions/course/:courseId
// @access  Private
exports.getSessionsByCourse = async (req, res) => {
  try {
    const sessions = await Session.find({ cours: req.params.courseId })
      .populate('enseignant', 'nom prenom');

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions du cours',
      error: error.message
    });
  }
};

// @desc    Mettre à jour le statut d'une session
// @route   PUT /api/sessions/:id/status
// @access  Private/Admin/Teacher
exports.updateSessionStatus = async (req, res) => {
  try {
    const { statut } = req.body;

    if (!statut || !['planifiée', 'en cours', 'terminée', 'annulée'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut de la session',
      error: error.message
    });
  }
};