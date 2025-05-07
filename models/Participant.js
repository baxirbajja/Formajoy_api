const mongoose = require('mongoose');

// Schéma pour les participants d'organisations
const ParticipantSchema = new mongoose.Schema({
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis']
  },
  poste: {
    type: String,
    required: [true, 'Le poste/fonction est requis']
  },
  coursInscrits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  presences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Participant', ParticipantSchema);