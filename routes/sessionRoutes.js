const express = require('express');
const { getSessions, getSession, createSession, updateSession, deleteSession, getSessionsByCourse, updateSessionStatus } = require('../controllers/sessionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.get('/', getSessions);
router.get('/:id', getSession);

// Protection des routes suivantes
router.use(protect);

// Routes pour les sessions (accès restreint)
router.post('/', authorize('admin'), createSession);
router.put('/:id', authorize('admin', 'enseignant'), updateSession);
router.delete('/:id', authorize('admin'), deleteSession);

// Routes spécifiques
router.get('/course/:courseId', getSessionsByCourse);
router.put('/:id/status', authorize('admin', 'enseignant'), updateSessionStatus);

module.exports = router;