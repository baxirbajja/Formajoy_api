const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const StudentSchema = new mongoose.Schema({
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
    default: 'etudiant',
    immutable: true
  },
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis']
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse est requise']
  },
  dateNaissance: {
    type: Date,
    required: [true, 'La date de naissance est requise']
  },
  promotionApplicable: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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
    dateInscription: {
      type: Date,
      default: Date.now
    }
  }],
  montantTotal: {
    type: Number,
    default: 0
  },
  presences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  }],



  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Fonction pour calculer le montant total avec promotion
const calculerMontantTotal = function(cours, promotionApplicable) {
  if (cours && cours.length > 0) {
    return cours.reduce((total, cours) => {
      const prixAvecPromotion = cours.prix * (1 - promotionApplicable / 100);
      return total + prixAvecPromotion;
    }, 0);
  }
  return 0;
};

// Middleware pour calculer le montant total avec promotion avant la sauvegarde
StudentSchema.pre('save', function(next) {
  this.montantTotal = calculerMontantTotal(this.cours, this.promotionApplicable);
  next();
});

// Middleware pour calculer le montant total avec promotion avant la mise à jour
StudentSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.promotionApplicable !== undefined || update.cours !== undefined) {
    const doc = await this.model.findOne(this.getQuery());
    if (!doc) return next();
    
    const cours = update.cours || doc.cours;
    const promotionApplicable = update.promotionApplicable || doc.promotionApplicable;
    update.montantTotal = calculerMontantTotal(cours, promotionApplicable);
  }
  next();
});





// Méthode pour générer un JWT
StudentSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Méthode pour comparer les mots de passe
StudentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);