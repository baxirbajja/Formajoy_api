const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const OrganizationSchema = new mongoose.Schema({
  nomOrganisation: {
    type: String,
    required: [true, 'Le nom de l\'organisation est requis'],
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
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    default: 'organisation',
    immutable: true
  },
  secteurActivite: {
    type: String,
    required: [true, 'Le secteur d\'activité est requis']
  },
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis']
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse est requise']
  },
  personneContact: {
    type: String,
    required: [true, 'Le nom de la personne de contact est requis']
  },
  emailContact: {
    type: String,
    required: [true, 'L\'email de contact est requis'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  promotionApplicable: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  }],
  cours: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],

  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Middleware pour hasher le mot de passe avant l'enregistrement
OrganizationSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour générer un JWT
OrganizationSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Méthode pour comparer les mots de passe
OrganizationSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Organization', OrganizationSchema);