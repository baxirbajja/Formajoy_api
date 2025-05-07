const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Student = require('../models/Student');
const Participant = require('../models/Participant');

// @desc    Obtenir toutes les présences
// @route   GET /api/attendances
// @access  Private/Admin
exports.getAttendances = async (req, res) => {
  try {
    const attendances = await Attendance.find()
      .populate('session', 'date heureDebut heureFin')
      .populate('etudiant', 'nom prenom')
      .populate('participant', 'nom prenom');

    res.status(200).json({
      success: true,
      count: attendances.length,
      data: attendances
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des présences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des présences',
      error: error.message
    });
  }
};

// @desc    Obtenir une présence par ID
// @route   GET /api/attendances/:id
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('session', 'date heureDebut heureFin')
      .populate('etudiant', 'nom prenom')
      .populate('participant', 'nom prenom');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Présence non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la présence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la présence',
      error: error.message
    });
  }
};

// @desc    Créer une nouvelle présence
// @route   POST /api/attendances
// @access  Private/Admin/Teacher
exports.createAttendance = async (req, res) => {
  try {
    // Vérifier si la session existe
    const session = await Session.findById(req.body.session);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    // Vérifier si l'étudiant ou le participant existe
    if (req.body.etudiant) {
      const student = await Student.findById(req.body.etudiant);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Étudiant non trouvé'
        });
      }
    } else if (req.body.participant) {
      const participant = await Participant.findById(req.body.participant);
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'Participant non trouvé'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Un étudiant ou un participant doit être spécifié'
      });
    }

    const attendance = await Attendance.create(req.body);

    // Ajouter la présence à la session
    await Session.findByIdAndUpdate(
      req.body.session,
      { $push: { presences: attendance._id } }
    );

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Erreur lors de la création de la présence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la présence',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une présence
// @route   PUT /api/attendances/:id
// @access  Private/Admin/Teacher
exports.updateAttendance = async (req, res) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Présence non trouvée'
      });
    }

    attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la présence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la présence',
      error: error.message
    });
  }
};

// @desc    Supprimer une présence
// @route   DELETE /api/attendances/:id
// @access  Private/Admin
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Présence non trouvée'
      });
    }

    // Supprimer la référence de la présence dans la session
    await Session.findByIdAndUpdate(
      attendance.session,
      { $pull: { presences: attendance._id } }
    );

    await attendance.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la présence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la présence',
      error: error.message
    });
  }
};

// @desc    Obtenir les présences d'une session
// @route   GET /api/attendances/session/:sessionId
// @access  Private/Admin/Teacher
exports.getAttendancesBySession = async (req, res) => {
  try {
    const attendances = await Attendance.find({ session: req.params.sessionId })
      .populate('etudiant', 'nom prenom')
      .populate('participant', 'nom prenom');

    res.status(200).json({
      success: true,
      count: attendances.length,
      data: attendances
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des présences de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des présences de la session',
      error: error.message
    });
  }
};

// @desc    Marquer la présence d'un étudiant ou participant
// @route   POST /api/attendances/mark
// @access  Private/Admin/Teacher
exports.markAttendance = async (req, res) => {
  try {
    const { session, etudiant, participant, present, heureArrivee } = req.body;

    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID de la session est requis'
      });
    }

    if (!etudiant && !participant) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID de l\'étudiant ou du participant est requis'
      });
    }

    // Vérifier si une présence existe déjà
    const existingAttendance = await Attendance.findOne({
      session,
      ...(etudiant ? { etudiant } : { participant })
    });

    if (existingAttendance) {
      // Mettre à jour la présence existante
      const updatedAttendance = await Attendance.findByIdAndUpdate(
        existingAttendance._id,
        { 
          present, 
          heureArrivee: heureArrivee || new Date().toLocaleTimeString(),
          ...req.body
        },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        data: updatedAttendance
      });
    }

    // Créer une nouvelle présence
    const newAttendance = await Attendance.create({
      session,
      ...(etudiant ? { etudiant } : { participant }),
      present: present !== undefined ? present : true,
      heureArrivee: heureArrivee || new Date().toLocaleTimeString(),
      ...req.body
    });

    // Ajouter la présence à la session
    await Session.findByIdAndUpdate(
      session,
      { $push: { presences: newAttendance._id } }
    );

    res.status(201).json({
      success: true,
      data: newAttendance
    });
  } catch (error) {
    console.error('Erreur lors du marquage de la présence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de la présence',
      error: error.message
    });
  }
};