const mongoose = require('mongoose');

// Schéma pour les sessions de cours
const SessionSchema = new mongoose.Schema({
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Le cours associé est requis']
  },
  date: {
    type: Date,
    required: [true, 'La date de la session est requise']
  },
  heureDebut: {
    type: String,
    required: [true, 'L\'heure de début est requise']
  },
  heureFin: {
    type: String,
    required: [true, 'L\'heure de fin est requise']
  },
  salle: {
    type: String,
    required: [true, 'La salle est requise']
  },
  statut: {
    type: String,
    enum: ['planifiée', 'en cours', 'terminée', 'annulée'],
    default: 'planifiée'
  },
  enseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'L\'enseignant est requis']
  },
  presences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', SessionSchema);