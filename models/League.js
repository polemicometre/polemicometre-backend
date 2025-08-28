const mongoose = require('mongoose');
const leagueSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  logo: { type: String, required: true },
  color: String, // 👈 AJOUTER CETTE LIGNE
});
module.exports = mongoose.models.League || mongoose.model('League', leagueSchema);