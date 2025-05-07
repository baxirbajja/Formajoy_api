const mongoose = require('mongoose');

// Schéma pour les présences aux sessions
const AttendanceSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'La session est requise']
  },
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  },
  present: {
    type: Boolean,
    default: false
  },
  heureArrivee: {
    type: String
  },
  heureDepart: {
    type: String
  },
  commentaire: {
    type: String
  }
}, {
  timestamps: true
});

// Validation pour s'assurer qu'un étudiant ou un participant est spécifié
AttendanceSchema.pre('validate', function(next) {
  if (!this.etudiant && !this.participant) {
    this.invalidate('etudiant', 'Un étudiant ou un participant doit être spécifié');
  }
  next();
});

module.exports = mongoose.model('Attendance', AttendanceSchema);