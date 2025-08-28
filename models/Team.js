const mongoose = require('mongoose');
const teamSchema = new mongoose.Schema({ name: { type: String, required: true, unique: true }, logo: { type: String, required: true }, leagues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'League' }], });
module.exports = mongoose.models.Team || mongoose.model('Team', teamSchema);