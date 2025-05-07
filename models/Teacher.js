const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const TeacherSchema = new mongoose.Schema({
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
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    default: 'enseignant',
    immutable: true
  },
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis']
  },
  adresse: {
    type: String
  },
  specialite: {
    type: String,
    required: [true, 'La spécialité est requise']
  },
  pourcentageProfit: {
    type: Number,
    min: 0,
    max: 100
  },
  heuresDisponibles: {
    type: [{
      jour: {
        type: String,
        enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
      },
      debut: String,
      fin: String
    }]
  },
  sessionsParSemaine: {
    type: Number,
    default: 0
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif'
  },
  cours: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    prix: {
      type: Number,
      required: true
    },
    dateAssignation: {
      type: Date,
      default: Date.now
    }
  }],
  salaire: {
    type: Number,
    required: [true, 'Le salaire est requis'],
    min: 0
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Méthode pour générer un JWT
TeacherSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Méthode pour comparer les mots de passe
TeacherSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Teacher', TeacherSchema);