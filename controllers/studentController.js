const Student = require('../models/Student');

// @desc    Obtenir tous les étudiants
// @route   GET /api/students
// @access  Private/Admin
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des étudiants',
      error: error.message
    });
  }
};

// @desc    Obtenir un étudiant par ID
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate({
        path: 'cours',
        select: 'titre description niveau duree prix enseignant',
        populate: {
          path: 'enseignant',
          select: 'nom prenom email specialite telephone'
        }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'étudiant',
      error: error.message
    });
  }
};

// @desc    Obtenir le profil d'un étudiant avec ses cours
// @route   GET /api/participants/student/:id
// @access  Private
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate({
        path: 'cours',
        select: 'titre description niveau duree prix enseignant',
        populate: {
          path: 'enseignant',
          select: 'nom prenom email specialite telephone'
        }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: student._id,
        nom: student.nom,
        prenom: student.prenom,
        email: student.email,
        telephone: student.telephone,
        dateNaissance: student.dateNaissance,
        adresse: student.adresse,
        cours: student.cours
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil étudiant',
      error: error.message
    });
  }
};

// @desc    Créer un nouvel étudiant
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'étudiant',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un étudiant
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    student = await Student.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'étudiant',
      error: error.message
    });
  }
};

// @desc    Supprimer un étudiant
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    await student.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'étudiant',
      error: error.message
    });
  }
};

const Course = require('../models/Course');

// @desc    Inscrire un étudiant à un cours
// @route   POST /api/students/:id/enroll/:courseId
// @access  Private
exports.enrollCourse = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const course = await Course.findById(req.params.courseId);

    // Effectuer toutes les validations nécessaires
    if (!student || !course) {
      return res.status(404).json({
        success: false,
        message: !student ? 'Étudiant non trouvé' : 'Cours non trouvé'
      });
    }

    // Vérifier si l'étudiant est déjà inscrit au cours
    const isAlreadyEnrolled = student.cours.some(c => c.course.toString() === req.params.courseId);
    if (isAlreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'L\'étudiant est déjà inscrit à ce cours'
      });
    }

    // Calculer le prix final en tenant compte de la promotion
    const prixFinal = course.prix * (1 - student.promotionApplicable / 100);

    // Ajouter le cours à la liste des cours de l'étudiant
    student.cours.push({
      course: course._id,
      prix: prixFinal,
      dateInscription: Date.now()
    });

    // Mettre à jour le montant total
    student.montantTotal += prixFinal;

    // Ajouter l'étudiant à la liste des étudiants inscrits du cours
    course.etudiantsInscrits.push(student._id);

    // Sauvegarder les modifications
    await Promise.all([student.save(), course.save()]);

    // Envoyer la réponse finale
    return res.status(200).json({
      success: true,
      message: 'Inscription au cours réussie',
      data: {
        coursId: course._id,
        prixFinal,
        dateInscription: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription au cours:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription au cours',
      error: error.message
    });
  }
};