const express = require('express');
const { 
  getPayments, 
  getPayment, 
  createPayment, 
  updatePayment, 
  deletePayment, 
  getRecipientPayments 
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

// Routes pour les paiements
router.route('/')
  .get(authorize('admin'), getPayments)
  .post(authorize('admin'), createPayment);

router.route('/:id')
  .get(authorize('admin'), getPayment)
  .put(authorize('admin'), updatePayment)
  .delete(authorize('admin'), deletePayment);

// Route pour obtenir les paiements d'un destinataire spécifique (étudiant ou enseignant)
router.get('/recipient/:model/:id', authorize('admin', 'etudiant', 'enseignant'), getRecipientPayments);

module.exports = router;