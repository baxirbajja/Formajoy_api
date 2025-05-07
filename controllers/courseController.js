const Course = require('../models/Course');

// @desc    Obtenir tous les cours
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('enseignant', '_id nom prenom');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours',
      error: error.message
    });
  }
};

// @desc    Obtenir un cours par ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enseignant', 'nom prenom email specialite telephone')
      .populate('etudiantsInscrits', 'nom prenom email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du cours',
      error: error.message
    });
  }
};

// @desc    Créer un nouveau cours
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);

    // Si un enseignant est assigné, mettre à jour ses informations
    if (course.enseignant) {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findById(course.enseignant);

      if (teacher) {
        teacher.cours.push({
          course: course._id,
          prix: course.prix,
          pourcentageProfit: teacher.pourcentageProfit,
          dateAssignation: new Date()
        });
        await teacher.save();
      }
    }

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du cours',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un cours
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Valider les données avant la mise à jour
    const updateData = { ...req.body };
    
    // Convertir les dates en objets Date
    if (updateData.dateDebut) updateData.dateDebut = new Date(updateData.dateDebut);
    if (updateData.dateFin) updateData.dateFin = new Date(updateData.dateFin);

    const oldTeacherId = course.enseignant;
    course = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation des données'
      });
    }

    // Gérer le changement d'enseignant
    const Teacher = require('../models/Teacher');
    try {
      if (req.body.enseignant && req.body.enseignant !== oldTeacherId) {
        // Retirer le cours de l'ancien enseignant
        if (oldTeacherId) {
          const oldTeacher = await Teacher.findById(oldTeacherId);
          if (oldTeacher) {
            oldTeacher.cours = oldTeacher.cours.filter(c => c.course && !c.course.equals(course._id));
            await oldTeacher.save();
          }
        }

        // Ajouter le cours au nouvel enseignant
        const newTeacher = await Teacher.findById(req.body.enseignant);
        if (newTeacher) {
          newTeacher.cours.push({
            course: course._id,
            prix: course.prix,
            pourcentageProfit: newTeacher.pourcentageProfit || 0,
            dateAssignation: new Date()
          });
          await newTeacher.save();
        }
      } else if (req.body.prix && course.enseignant) {
        // Mettre à jour le prix pour l'enseignant existant
        const teacher = await Teacher.findById(course.enseignant);
        if (teacher) {
          const courseIndex = teacher.cours.findIndex(c => c.course && c.course.equals(course._id));
          if (courseIndex !== -1) {
            teacher.cours[courseIndex].prix = req.body.prix;
            await teacher.save();
          }
        }
      }
    } catch (teacherError) {
      console.error('Erreur lors de la mise à jour des informations de l\'enseignant:', teacherError);
      // Continuer malgré l'erreur pour renvoyer le cours mis à jour
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du cours',
      error: error.message
    });
  }
};

// @desc    Supprimer un cours
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du cours',
      error: error.message
    });
  }
};

// @desc    Ajouter un étudiant à un cours
// @route   POST /api/courses/:id/students
// @access  Private/Admin
exports.addStudentToCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const { studentId } = req.body;

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Vérifier si l'étudiant est déjà inscrit au cours
    if (course.etudiantsInscrits.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'L\'étudiant est déjà inscrit à ce cours'
      });
    }

    // Ajouter l'étudiant à la liste des étudiants inscrits avec le prix
    const Student = require('../models/Student');
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    // Ajouter le cours avec son prix à l'étudiant
    student.cours.push({
      course: course._id,
      prix: course.prix
    });
    
    // Calculer le montant total
    let montantTotal = student.cours.reduce((total, cours) => total + cours.prix, 0);
    
    // Appliquer la promotion si applicable
    if (student.promotionApplicable > 0) {
      montantTotal = montantTotal * (1 - student.promotionApplicable / 100);
    }
    
    student.montantTotal = montantTotal;
    await student.save();

    // Ajouter l'étudiant au cours
    course.etudiantsInscrits.push(studentId);
    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'étudiant au cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de l\'étudiant au cours',
      error: error.message
    });
  }
};

// @desc    Supprimer un étudiant d'un cours
// @route   DELETE /api/courses/:id/students/:studentId
// @access  Private/Admin
exports.removeStudentFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    const Student = require('../models/Student');
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    // Vérifier si l'étudiant est inscrit au cours
    if (!course.etudiantsInscrits.includes(req.params.studentId)) {
      return res.status(400).json({
        success: false,
        message: 'L\'étudiant n\'est pas inscrit à ce cours'
      });
    }

    // Retirer le cours de la liste des cours de l'étudiant
    student.cours = student.cours.filter(c => !c.course.equals(course._id));
    
    // Recalculer le montant total
    let montantTotal = student.cours.reduce((total, cours) => total + cours.prix, 0);
    
    // Appliquer la promotion si applicable
    if (student.promotionApplicable > 0) {
      montantTotal = montantTotal * (1 - student.promotionApplicable / 100);
    }
    
    student.montantTotal = montantTotal;
    await student.save();

    // Retirer l'étudiant de la liste des étudiants inscrits
    course.etudiantsInscrits = course.etudiantsInscrits.filter(
      studentId => studentId.toString() !== req.params.studentId
    );
    await course.save();

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étudiant du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'étudiant du cours',
      error: error.message
    });
  }
};

// @desc    Obtenir les cours d'un enseignant
// @route   GET /api/courses/teacher/:id
// @access  Public
exports.getCoursesByTeacher = async (req, res) => {
  try {
    const courses = await Course.find({ enseignant: req.params.id })
      .populate('enseignant', 'nom prenom email specialite telephone');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cours de l\'enseignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours de l\'enseignant',
      error: error.message
    });
  }
};

// @desc    Obtenir les étudiants d'un cours
// @route   GET /api/courses/:id/students
// @access  Public
exports.getStudentsByCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('etudiantsInscrits', 'nom prenom email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      count: course.etudiantsInscrits.length,
      data: course.etudiantsInscrits
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des étudiants du cours',
      error: error.message
    });
  }
};



// @desc    Obtenir les cours d'un étudiant
// @route   GET /api/courses/student/:id
// @access  Public
exports.getCoursesByStudent = async (req, res) => {
  try {
    const courses = await Course.find({ etudiantsInscrits: req.params.id })
      .populate('enseignant', 'nom prenom email specialite telephone');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cours de l\'étudiant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cours de l\'étudiant',
      error: error.message
    });
  }
};
