const express = require('express');
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent, enrollCourse } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

// Routes pour les étudiants
router.route('/')
  .get(authorize('admin'), getStudents)
  .post(authorize('admin'), createStudent);

router.route('/:id')
  .get(authorize('admin', 'etudiant'), getStudent)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

// Route pour l'inscription à un cours
router.post('/:id/enroll/:courseId', authorize('admin', 'etudiant'), enrollCourse);

module.exports = router;