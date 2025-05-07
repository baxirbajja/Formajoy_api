const express = require('express');
const { getParticipants, getParticipant, createParticipant, updateParticipant, deleteParticipant, enrollCourse } = require('../controllers/participantController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

// Routes pour les participants
router.route('/')
  .get(authorize('admin', 'organisation'), getParticipants)
  .post(authorize('admin', 'organisation'), createParticipant);

router.route('/:id')
  .get(authorize('admin', 'organisation'), getParticipant)
  .put(authorize('admin', 'organisation'), updateParticipant)
  .delete(authorize('admin', 'organisation'), deleteParticipant);

// Route pour l'inscription à un cours
router.post('/:id/enroll/:courseId', authorize('admin', 'organisation'), enrollCourse);

module.exports = router;