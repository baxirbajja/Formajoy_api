const express = require('express');
const { getAttendances, getAttendance, createAttendance, updateAttendance, deleteAttendance, getAttendancesBySession, markAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

// Routes pour les présences
router.route('/')
  .get(authorize('admin', 'enseignant'), getAttendances)
  .post(authorize('admin', 'enseignant'), createAttendance);

router.route('/:id')
  .get(authorize('admin', 'enseignant'), getAttendance)
  .put(authorize('admin', 'enseignant'), updateAttendance)
  .delete(authorize('admin'), deleteAttendance);

// Routes spécifiques
router.get('/session/:sessionId', authorize('admin', 'enseignant'), getAttendancesBySession);
router.post('/mark', authorize('admin', 'enseignant'), markAttendance);

module.exports = router;