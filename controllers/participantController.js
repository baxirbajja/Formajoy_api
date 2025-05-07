const Participant = require('../models/Participant');
const Organization = require('../models/Organization');

// @desc    Obtenir tous les participants
// @route   GET /api/participants
// @access  Private/Admin
exports.getParticipants = async (req, res) => {
  try {
    const participants = await Participant.find().populate('organisation', 'nomOrganisation');

    res.status(200).json({
      success: true,
      count: participants.length,
      data: participants
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des participants',
      error: error.message
    });
  }
};

// @desc    Obtenir un participant par ID
// @route   GET /api/participants/:id
// @access  Private
exports.getParticipant = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id)
      .populate('organisation')
      .populate('coursInscrits')
      .populate('presences');

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: participant
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du participant',
      error: error.message
    });
  }
};

// @desc    Créer un nouveau participant
// @route   POST /api/participants
// @access  Private/Admin
exports.createParticipant = async (req, res) => {
  try {
    const { organisation, ...participantData } = req.body;

    // Vérifier si l'organisation existe
    const organizationExists = await Organization.findById(organisation);
    if (!organizationExists) {
      return res.status(404).json({
        success: false,
        message: 'Organisation non trouvée'
      });
    }

    const participant = await Participant.create({
      organisation,
      ...participantData
    });

    // Ajouter le participant à la liste des participants de l'organisation
    await Organization.findByIdAndUpdate(organisation, {
      $push: { participants: participant._id }
    });

    res.status(201).json({
      success: true,
      data: participant
    });
  } catch (error) {
    console.error('Erreur lors de la création du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du participant',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un participant
// @route   PUT /api/participants/:id
// @access  Private/Admin
exports.updateParticipant = async (req, res) => {
  try {
    let participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }

    participant = await Participant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: participant
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du participant',
      error: error.message
    });
  }
};

// @desc    Supprimer un participant
// @route   DELETE /api/participants/:id
// @access  Private/Admin
exports.deleteParticipant = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }

    // Retirer le participant de la liste des participants de l'organisation
    await Organization.findByIdAndUpdate(participant.organisation, {
      $pull: { participants: participant._id }
    });

    await participant.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du participant',
      error: error.message
    });
  }
};

// @desc    Inscrire un participant à un cours
// @route   POST /api/participants/:id/enroll/:courseId
// @access  Private/Admin
exports.enrollCourse = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id);
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }

    // Vérifier si le participant est déjà inscrit au cours
    if (participant.coursInscrits.includes(req.params.courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Le participant est déjà inscrit à ce cours'
      });
    }

    // Ajouter le cours à la liste des cours du participant
    participant.coursInscrits.push(req.params.courseId);
    await participant.save();

    res.status(200).json({
      success: true,
      data: participant
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription du participant au cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription du participant au cours',
      error: error.message
    });
  }
};