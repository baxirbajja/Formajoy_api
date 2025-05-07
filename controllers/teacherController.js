const Teacher = require('../models/Teacher');

// @desc    Obtenir tous les enseignants
// @route   GET /api/teachers
// @access  Private/Admin
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des enseignants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des enseignants',
      error: error.message
    });
  }
};

// @desc    Obtenir un enseignant par ID
// @route   GET /api/teachers/:id
// @access  Private
exports.getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'enseignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'enseignant',
      error: error.message
    });
  }
};

// @desc    Créer un nouvel enseignant
// @route   POST /api/teachers
// @access  Private/Admin
exports.createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);

    res.status(201).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'enseignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'enseignant',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un enseignant
// @route   PUT /api/teachers/:id
// @access  Private/Admin
exports.updateTeacher = async (req, res) => {
  try {
    let teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'enseignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'enseignant',
      error: error.message
    });
  }
};

// @desc    Supprimer un enseignant
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    await teacher.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'enseignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'enseignant',
      error: error.message
    });
  }
};