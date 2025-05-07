const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// @desc    Obtenir tous les paiements
// @route   GET /api/payments
// @access  Private (Admin)
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'recipient',
        select: 'nom prenom email',
      });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements',
      error: error.message
    });
  }
};

// @desc    Obtenir un paiement spécifique
// @route   GET /api/payments/:id
// @access  Private (Admin)
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'recipient',
        select: 'nom prenom email'
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du paiement',
      error: error.message
    });
  }
};

// @desc    Créer un nouveau paiement
// @route   POST /api/payments
// @access  Private (Admin)
exports.createPayment = async (req, res) => {
  try {
    // Vérifier si le destinataire existe et calculer le montant total pour les étudiants
    let recipient;
    let montantTotal = 0;

    if (req.body.recipientModel === 'Student') {
      recipient = await Student.findById(req.body.recipient).populate('cours');
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Étudiant non trouvé'
        });
      }
      // Calculer le montant total des cours
      montantTotal = recipient.cours.reduce((total, cours) => total + cours.prix, 0);
      // Appliquer la promotion si applicable
      if (recipient.promotionApplicable > 0) {
        montantTotal = montantTotal * (1 - recipient.promotionApplicable / 100);
      }
      // Ajouter le montant au corps de la requête
      req.body.montant = montantTotal;
    } else if (req.body.recipientModel === 'Teacher') {
      recipient = await Teacher.findById(req.body.recipient);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Enseignant non trouvé'
        });
      }
    }

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: `${req.body.recipientModel === 'Student' ? 'Étudiant' : 'Enseignant'} non trouvé`
      });
    }

    const payment = await Payment.create(req.body);

    // Populate le paiement créé avec les informations du destinataire
    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'recipient',
        select: 'nom prenom email cours promotionApplicable'
      });

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création du paiement',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un paiement
// @route   PUT /api/payments/:id
// @access  Private (Admin)
exports.updatePayment = async (req, res) => {
  try {
    let payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Si le statut passe à 'payé', ajouter la date de paiement
    if (req.body.status === 'payé' && payment.status !== 'payé') {
      req.body.paymentDate = new Date();
    }

    payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du paiement',
      error: error.message
    });
  }
};

// @desc    Supprimer un paiement
// @route   DELETE /api/payments/:id
// @access  Private (Admin)
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    await payment.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du paiement',
      error: error.message
    });
  }
};

// @desc    Obtenir les paiements d'un étudiant ou enseignant spécifique
// @route   GET /api/payments/recipient/:model/:id
// @access  Private (Admin, Étudiant, Enseignant)
exports.getRecipientPayments = async (req, res) => {
  try {
    const { model, id } = req.params;
    
    if (!['Student', 'Teacher'].includes(model)) {
      return res.status(400).json({
        success: false,
        message: 'Modèle de destinataire invalide'
      });
    }

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de destinataire invalide'
      });
    }

    const payments = await Payment.find({
      recipient: id,
      recipientModel: model
    }).sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements',
      error: error.message
    });
  }
};