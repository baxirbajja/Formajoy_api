const express = require('express');
const { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

// Routes pour les enseignants
router.route('/')
  .get(authorize('admin'), getTeachers)
  .post(authorize('admin'), createTeacher);

router.route('/:id')
  .get(authorize('admin', 'enseignant'), getTeacher)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

module.exports = router;