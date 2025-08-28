const mongoose = require('mongoose');
const settingsSchema = new mongoose.Schema({ siteTitle: { type: String, default: 'Polemicometre' }, siteFavicon: { type: String, default: 'favicon.ico' } });
module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);