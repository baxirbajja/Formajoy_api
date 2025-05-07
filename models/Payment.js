const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // Référence à l'étudiant ou l'enseignant
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  // Modèle de référence (Student ou Teacher)
  recipientModel: {
    type: String,
    required: true,
    enum: ['Student', 'Teacher']
  },

  // Année du paiement
  year: {
    type: Number,
    required: [true, 'L\'année est requise']
  },
  // Mois du paiement
  month: {
    type: Number,
    required: [true, 'Le mois est requis'],
    min: 1,
    max: 12
  },
  // Statut du paiement
  status: {
    type: String,
    enum: ['en attente', 'payé', 'annulé'],
    default: 'en attente'
  },
  // Date de paiement (quand le statut passe à payé)
  paymentDate: {
    type: Date
  },
  // Description ou note sur le paiement
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);