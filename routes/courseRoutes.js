const express = require('express');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, addStudentToCourse, getStudentsByCourse, getCoursesByTeacher, getCoursesByStudent, removeStudentFromCourse } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.get('/', getCourses);
router.get('/teacher/:id', getCoursesByTeacher);
router.get('/student/:id', getCoursesByStudent);
router.get('/:id', getCourse);
router.get('/:id/students', getStudentsByCourse);

// Routes protégées
router.use(protect);

// Routes pour les cours (accès restreint)
router.post('/', authorize('admin'), createCourse);
router.put('/:id', authorize('admin'), updateCourse);
router.delete('/:id', authorize('admin'), deleteCourse);

// Routes pour la gestion des étudiants dans un cours
router.post('/:id/students', authorize('admin'), addStudentToCourse);
router.delete('/:id/students/:studentId', authorize('admin'), removeStudentFromCourse);

// Route pour retirer l'enseignant d'un cours


module.exports = router;