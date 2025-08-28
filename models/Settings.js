const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteTitle: { type: String, default: 'Polemicometre' },
  siteFavicon: { type: String, default: 'favicon.ico' }
});

// Utilise 'mongoose.models.Settings' pour éviter de recompiler le modèle à chaque fois
module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);