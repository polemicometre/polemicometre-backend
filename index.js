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
const corsOptions = { origin: ['https://polemicometre.xo.je', 'http://localhost:5173'], optionsSuccessStatus: 200 };
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

// ... (toutes les routes GET/PATCH/POST existantes restent ici)

// --- NOUVELLES ROUTES POUR LES ACTIONS DE MASSE ---

// Suppression multiple d'équipes
app.post('/api/teams/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ m: "Aucun ID fourni." });
    }
    await Team.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ m: "Équipes supprimées avec succès." });
  } catch (e) {
    res.status(500).json({ m: e.message });
  }
});

// Suppression multiple de matchs
app.post('/api/matches/delete-multiple', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ m: "Aucun ID fourni." });
    }
    await Match.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ m: "Matchs supprimés avec succès." });
  } catch (e) {
    res.status(500).json({ m: e.message });
  }
});

// Ajout multiple de matchs
app.post('/api/matches/batch', async (req, res) => {
    try {
        const { matches: matchesData, competitionId } = req.body;
        if (!matchesData || !Array.isArray(matchesData) || !competitionId) {
            return res.status(400).json({ m: 'Données invalides' });
        }

        const newMatches = [];
        for (const matchInfo of matchesData) {
            const homeTeam = await Team.findOne({ name: matchInfo.home });
            const awayTeam = await Team.findOne({ name: matchInfo.away });

            if (homeTeam && awayTeam) {
                newMatches.push({
                    date_match: matchInfo.date,
                    competition: competitionId,
                    equipe_domicile: homeTeam._id,
                    equipe_exterieur: awayTeam._id,
                    status: 'à venir',
                });
            }
        }
        await Match.insertMany(newMatches);
        res.status(201).json({ m: `${newMatches.length} matchs créés avec succès.` });
    } catch (e) {
        res.status(500).json({ m: e.message });
    }
});

module.exports = app;
