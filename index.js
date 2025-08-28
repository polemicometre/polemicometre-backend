const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const Match = require('./models/Match');
const League = require('./models/League');
const Team = require('./models/Team');
const Settings = require('./models/Settings');

const app = express();

const allowedOrigins = ['https://polemicometre.xo.je', 'http://localhost:5173'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI).then(() => console.log("Connexion MongoDB réussie !")).catch(err => console.log("Échec : ", err));

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const storage = multer.memoryStorage();
const upload = multer({ storage });

const handleUpload = (folder) => async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier uploadé' });
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: `polemicometre/${folder}` }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      uploadStream.end(req.file.buffer);
    });
    res.status(201).json({ imageUrl: result.secure_url });
  } catch (error) { res.status(500).json({ error: "Erreur lors de l'upload de l'image." }); }
};

app.post('/api/upload/logo', upload.single('logo'), handleUpload('logos'));
app.post('/api/upload/article-image', upload.single('image'), handleUpload('article_images'));

app.get('/api/stats', async (req, res) => { try { const leagueCount = await League.countDocuments(); const teamCount = await Team.countDocuments(); const matchCount = await Match.countDocuments(); const ratedMatchCount = await Match.countDocuments({ status: 'terminé_noté' }); res.json({ leagues: leagueCount, teams: teamCount, matches: matchCount, ratedMatches: ratedMatchCount }); } catch (e) { res.status(500).json({ m: "Erreur" }); } });
app.get('/api/global-score', async (req, res) => { try { const ratedMatches = await Match.find({ status: 'terminé_noté' }); let globalPolemicScore = 0; if (ratedMatches.length > 0) { const totalScore = ratedMatches.reduce((acc, match) => acc + (match.score_polemicometre || 0), 0); globalPolemicScore = Math.round(totalScore / ratedMatches.length); } res.json({ globalScore: globalPolemicScore }); } catch (e) { res.status(500).json({ m: "Erreur" }); } });
app.get('/api/articles', async (req, res) => { try { const page = parseInt(req.query.page) || 1; const limit = parseInt(req.query.limit) || 2; const skip = (page - 1) * limit; const totalArticles = await Match.countDocuments({ status: 'terminé_noté', titre_fr: { $exists: true, $ne: "" } }); const articles = await Match.find({ status: 'terminé_noté', titre_fr: { $exists: true, $ne: "" } }).sort({ date_match: -1 }).skip(skip).limit(limit).populate('competition equipe_domicile equipe_exterieur'); res.json({ articles, totalPages: Math.ceil(totalArticles / limit), currentPage: page }); } catch (e) { res.status(500).json({ m: "Erreur" }); } });
app.get('/api/settings', async (req, res) => { try { let settings = await Settings.findOne(); if (!settings) { settings = new Settings(); await settings.save(); } res.json(settings); } catch (e) { res.status(500).json({ m: "Erreur" }); } });
app.patch('/api/settings', async (req, res) => { try { const updatedSettings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true }); res.json(updatedSettings); } catch (e) { res.status(400).json({ m: e.message }); } });
app.get('/api/leagues', async (req, res) => { try { const d = await League.find().sort({ name: 1 }); res.json(d); } catch (e) { res.status(500).json({ m: e.message }); } });
app.post('/api/leagues', async (req, res) => { try { const d = new League(req.body); await d.save(); res.status(201).json(d); } catch (e) { res.status(400).json({ m: e.message }); } });
app.get('/api/leagues/:id', async (req, res) => { try { const d = await League.findById(req.params.id); res.json(d); } catch (e) { res.status(500).json({ m: e.message }); } });
app.patch('/api/leagues/:id', async (req, res) => { try { const d = await League.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(d); } catch (e) { res.status(400).json({ m: e.message }); } });
app.delete('/api/leagues/:id', async (req, res) => { try { await League.findByIdAndDelete(req.params.id); res.status(204).send(); } catch (e) { res.status(500).json({ m: e.message }); } });
app.get('/api/teams', async (req, res) => { try { const q = req.query.league ? { leagues: req.query.league } : {}; const d = await Team.find(q).populate('leagues').sort({ name: 1 }); res.json(d); } catch (e) { res.status(500).json({ m: e.message }); } });
app.post('/api/teams', async (req, res) => { try { const d = new Team(req.body); await d.save(); res.status(201).json(d); } catch (e) { res.status(400).json({ m: e.message }); } });
app.patch('/api/teams/:id', async (req, res) => { try { const d = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(d); } catch (e) { res.status(400).json({ m: e.message }); } });
app.delete('/api/teams/:id', async (req, res) => { try { await Team.findByIdAndDelete(req.params.id); res.status(204).send(); } catch (e) { res.status(500).json({ m: e.message }); } });
app.post('/api/teams/batch', async (req, res) => { try { const { leagueId, teams } = req.body; const createdTeams = []; for (const teamData of teams) { let team = await Team.findOne({ name: teamData.name }); if (team) { if (!team.leagues.includes(leagueId)) { team.leagues.push(leagueId); await team.save(); } } else { team = new Team({ ...teamData, leagues: [leagueId] }); await team.save(); } createdTeams.push(team); } res.status(201).json(createdTeams); } catch (e) { res.status(400).json({ m: e.message }); } });

// L'AJOUT EST ICI
app.post('/api/teams/delete-multiple', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || ids.length === 0) return res.status(400).json({ m: "Aucun ID fourni." });
        await Team.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ m: "Équipes supprimées." });
    } catch (e) {
        res.status(500).json({ m: e.message });
    }
});

app.get('/api/matches', async (req, res) => { try { const d = await Match.find().sort({ date_match: 1 }).populate('competition').populate('equipe_domicile').populate('equipe_exterieur'); res.json(d); } catch (e) { res.status(500).json({ m: e.message }); } });
app.get('/api/matches/:id', async (req, res) => { try { const d = await Match.findById(req.params.id).populate('competition').populate('equipe_domicile').populate('equipe_exterieur'); if (!d) { return res.status(404).json({ m: "Match non trouvé" }); } res.json(d); } catch (e) { res.status(500).json({ m: e.message }); }});
app.post('/api/matches', async (req, res) => { try { const d = new Match(req.body); await d.save(); res.status(201).json(d); } catch (e) { res.status(400).json({ m: e.message }); } });
app.patch('/api/matches/:id', async (req, res) => { try { const d = req.body; if (d.score_domicile !== null && d.score_exterieur !== null) { d.score = `${d.score_domicile}-${d.score_exterieur}`; } const u = await Match.findByIdAndUpdate(req.params.id, d, { new: true }); res.json(u); } catch (e) { res.status(400).json({ m: e.message }); } });
app.delete('/api/matches/:id', async (req, res) => { try { await Match.findByIdAndDelete(req.params.id); res.status(204).send(); } catch (e) { res.status(500).json({ m: e.message }); } });
app.post('/api/matches/:id/vote', async (req, res) => { try { const { vote_type } = req.body; const f = vote_type === 'pour' ? 'votes_pour' : 'votes_contre'; await Match.findByIdAndUpdate(req.params.id, { $inc: { [f]: 1 } }); const u = await Match.findById(req.params.id).populate('competition').populate('equipe_domicile').populate('equipe_exterieur'); res.json(u); } catch (e) { res.status(500).json({ m: e.message }); }});

module.exports = app;
