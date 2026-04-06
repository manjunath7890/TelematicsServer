const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

const userSchema = new mongoose.Schema({
  userName: String,
  role: String,
  email: String,
  contact: Number,
  accessToken: String,
  dealerToken: String,
  financeToken: String,
  password: String,
  date: {
    type: Date,
    default: () => new Date().toISOString().slice(0, 10),
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (!this.password || BCRYPT_HASH_REGEX.test(this.password)) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }

  if (!BCRYPT_HASH_REGEX.test(this.password)) {
    return candidatePassword === this.password;
  }

  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasLegacyPlaintextPassword = function () {
  return Boolean(this.password) && !BCRYPT_HASH_REGEX.test(this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
