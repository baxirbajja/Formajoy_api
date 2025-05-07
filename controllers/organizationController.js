const Organization = require('../models/Organization');
const Participant = require('../models/Participant');

// @desc    Obtenir toutes les organisations
// @route   GET /api/organizations
// @access  Private/Admin
exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();

    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des organisations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des organisations',
      error: error.message
    });
  }
};

// @desc    Obtenir une organisation par ID
// @route   GET /api/organizations/:id
// @access  Private
exports.getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('participants')
      .populate('cours');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organisation non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'organisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'organisation',
      error: error.message
    });
  }
};

// @desc    Créer une nouvelle organisation
// @route   POST /api/organizations
// @access  Private/Admin
exports.createOrganization = async (req, res) => {
  try {
    const organization = await Organization.create(req.body);

    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'organisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'organisation',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une organisation
// @route   PUT /api/organizations/:id
// @access  Private/Admin
exports.updateOrganization = async (req, res) => {
  try {
    let organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organisation non trouvée'
      });
    }

    organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'organisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'organisation',
      error: error.message
    });
  }
};

// @desc    Supprimer une organisation
// @route   DELETE /api/organizations/:id
// @access  Private/Admin
exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organisation non trouvée'
      });
    }

    // Supprimer tous les participants associés à cette organisation
    await Participant.deleteMany({ organisation: req.params.id });

    await organization.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'organisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'organisation',
      error: error.message
    });
  }
};