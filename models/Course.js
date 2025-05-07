const mongoose = require('mongoose');

// Schéma pour les cours
const CourseSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du cours est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description du cours est requise']
  },
  prix: {
    type: Number,
    required: [true, 'Le prix du cours est requis'],
    min: 0
  },
  prixSpecialOrganisation: {
    type: Number,
    min: 0
  },
  dureeHeures: {
    type: Number,
    required: [true, 'La durée totale du cours est requise'],
    min: 1
  },
  dateDebut: {
    type: Date,
    required: [true, 'La date de début du cours est requise']
  },
  dateFin: {
    type: Date,
    required: [true, 'La date de fin du cours est requise']
  },
  horaire: [{
    jour: {
      type: String,
      enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
      required: true
    },
    heureDebut: {
      type: String,
      required: true
    },
    heureFin: {
      type: String,
      required: true
    }
  }],
  salle: {
    type: String,
    required: [true, 'La salle du cours est requise']
  },
  enseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'L\'enseignant du cours est requis']
  },
  statut: {
    type: String,
    enum: ['planifié', 'en cours', 'terminé'],
    default: 'planifié'
  },
  etudiantsInscrits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  organisationsInscrites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }],
  participantsInscrits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  }],
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuel pour calculer le nombre total d'inscrits
CourseSchema.virtual('nombreInscrits').get(function() {
  return this.etudiantsInscrits.length + this.participantsInscrits.length;
});

module.exports = mongoose.model('Course', CourseSchema);