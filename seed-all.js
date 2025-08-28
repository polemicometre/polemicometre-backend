const mongoose = require('mongoose');
require('dotenv').config();
const League = require('./models/League');
const Team = require('./models/Team');
const Match = require('./models/Match');

// 1. DÉFINITION DES DONNÉES DE BASE (SYNCHRONISÉES AVEC VOTRE LISTE)
const leaguesData = {
    "LaLiga": { logo: "LaLiga.png", description: "Championnat d'Espagne", color: "#161b22" }, // Couleur neutre du thème
    "Copa del Rey": { logo: "Copa-del-Rey.png", description: "Coupe d'Espagne", color: "#B89D50" }, // Or royal
    "Supercopa de España": { logo: "Supercopa.png", description: "Supercoupe d'Espagne", color: "#a41017" }, // Rouge espagnol
    "Champions League": { logo: "Champions-League.png", description: "Ligue des Champions", color: "#0e1e32" }, // Bleu nuit officiel
};

const teamsData = [
    { name: "Real Madrid", logo: "Real-Madrid.png", leagues: ["LaLiga", "Supercopa de España", "Copa del Rey", "Champions League"] },
    { name: "CA Osasuna", logo: "CA-Osasuna.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Real Oviedo", logo: "Real-Oviedo.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "RCD Mallorca", logo: "RCD-Mallorca.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Real Sociedad", logo: "Real-Sociedad.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "RCD Espanyol de Barcelona", logo: "RCD-Espanyol.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Levante UD", logo: "Levante-UD.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Atlético de Madrid", logo: "Atletico-Madrid.png", leagues: ["LaLiga", "Supercopa de España", "Copa del Rey", "Champions League"] },
    { name: "Villarreal CF", logo: "Villarreal-CF.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Getafe CF", logo: "Getafe-CF.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "FC Barcelona", logo: "FC-Barcelona.png", leagues: ["LaLiga", "Copa del Rey", "Champions League"] },
    { name: "Valencia CF", logo: "Valencia-CF.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Rayo Vallecano", logo: "Rayo-Vallecano.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Elche CF", logo: "Elche-CF.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Girona FC", logo: "Girona-FC.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Celta de Vigo", logo: "Celta-Vigo.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Deportivo Alavés", logo: "Deportivo-Alaves.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Sevilla FC", logo: "Sevilla-FC.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Real Betis", logo: "Real-Betis.png", leagues: ["LaLiga", "Copa del Rey"] },
    { name: "Athletic Club", logo: "Athletic-Bilbao.png", leagues: ["LaLiga", "Copa del Rey"] }
];

const matchesData = [
 
  { date: "2025-08-19", home: "Real Madrid", away: "CA Osasuna", competition: "LaLiga" },
  { date: "2025-08-24", home: "Real Oviedo", away: "Real Madrid", competition: "LaLiga" },
  { date: "2025-08-31", home: "Real Madrid", away: "RCD Mallorca", competition: "LaLiga" },
  { date: "2025-09-14", home: "Real Sociedad", away: "Real Madrid", competition: "LaLiga" },
  { date: "2025-09-21", home: "Real Madrid", away: "RCD Espanyol de Barcelona", competition: "LaLiga" },
  { date: "2025-09-24", home: "Levante UD", away: "Real Madrid", competition: "LaLiga" },
  { date: "2025-09-28", home: "Atlético de Madrid", away: "Real Madrid", competition: "LaLiga" },
  { date: "2025-10-05", home: "Real Madrid", away: "Villarreal CF", competition: "LaLiga" },
  { date: "2025-10-19", home: "Getafe CF", away: "Real Madrid", competition: "LaLiga" },
  { date: "2025-10-26", home: "Real Madrid", away: "FC Barcelona", competition: "LaLiga" },
  { date: "2025-11-02", home: "Real Madrid", away: "Valencia CF", competition: "LaLiga" },
  { date: "2025-11-09", home: "Rayo Vallecano", away: "Real Madrid", competition: "LaLiga" },
  { date: "2025-11-23", home: "Elche CF", away: "Real Madrid", competition: "LaLiga" },
  { date: "2025-11-30", home: "Girona FC", away: "Real Madrid", competition: "LaLiga" },
  { date: "2025-12-07", home: "Real Madrid", away: "Celta de Vigo", competition: "LaLiga" },
  { date: "2025-12-14", home: "Deportivo Alavés", away: "Real Madrid", competition: "LaLiga" },
  { date: "2025-12-21", home: "Real Madrid", away: "Sevilla FC", competition: "LaLiga" },
  { date: "2026-01-04", home: "Real Madrid", away: "Real Betis", competition: "LaLiga" },
  { date: "2026-01-07", home: "Real Madrid", away: "Atlético de Madrid", competition: "Supercopa de España" },
  { date: "2026-01-11", home: "Athletic Club", away: "Real Madrid", competition: "LaLiga" },
  { date: "2026-01-18", home: "Real Madrid", away: "Levante UD", competition: "LaLiga" },
  { date: "2026-01-25", home: "Villarreal CF", away: "Real Madrid", competition: "LaLiga" },
  { date: "2026-02-01", home: "Real Madrid", away: "Rayo Vallecano", competition: "LaLiga" },
  { date: "2026-02-08", home: "Valencia CF", away: "Real Madrid", competition: "LaLiga" },
  { date: "2026-02-15", home: "Real Madrid", away: "Real Sociedad", competition: "LaLiga" },
  { date: "2026-02-22", home: "CA Osasuna", away: "Real Madrid", competition: "LaLiga" },
  { date: "2026-03-01", home: "Real Madrid", away: "Getafe CF", competition: "LaLiga" },
  { date: "2026-03-08", home: "Celta de Vigo", away: "Real Madrid", competition: "LaLiga" },
  { date: "2026-03-15", home: "Real Madrid", away: "Elche CF", competition: "LaLiga" },
  { date: "2026-03-22", home: "Real Madrid", away: "Atlético de Madrid", competition: "LaLiga" },
  { date: "2026-04-05", home: "RCD Mallorca", away: "Real Madrid", competition: "LaLiga" },
  { date: "2026-04-12", home: "Real Madrid", away: "Girona FC", competition: "LaLiga" },
  { date: "2026-04-19", home: "Real Betis", away: "Real Madrid", competition: "LaLiga" },
  { date: "2026-04-22", home: "Real Madrid", away: "Deportivo Alavés", competition: "LaLiga" },
  { date: "2026-05-03", home: "RCD Espanyol de Barcelona", away: "Real Madrid", competition: "LaLiga" },
  { date: "2026-05-10", home: "FC Barcelona", away: "Real Madrid", competition: "LaLiga" },
  { date: "2026-05-24", home: "Real Madrid", away: "Athletic Club", competition: "LaLiga" }
];

// 2. SCRIPT DE REMPLISSAGE
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Seed: Connexion réussie !");
    await Match.deleteMany({}); await Team.deleteMany({}); await League.deleteMany({});
    console.log("Seed: Collections vidées.");

    const createdLeagues = {};
    for (const name in leaguesData) {
      const newLeague = await new League({ name, ...leaguesData[name] }).save();
      createdLeagues[name] = newLeague;
    }
    console.log(`${Object.keys(createdLeagues).length} ligues créées.`);

    const createdTeams = {};
    for (const teamData of teamsData) {
      const leagueIds = teamData.leagues.map(leagueName => createdLeagues[leagueName]._id);
      const newTeam = await new Team({ name: teamData.name, logo: teamData.logo, leagues: leagueIds }).save();
      createdTeams[teamData.name] = newTeam;
    }
    console.log(`${Object.keys(createdTeams).length} équipes créées.`);

    const matchesToCreate = matchesData.map(match => ({
      date_match: match.date,
      competition: createdLeagues[match.competition]._id,
      equipe_domicile: createdTeams[match.home]._id,
      equipe_exterieur: createdTeams[match.away]._id,
      status: 'à venir',
    }));
    await Match.insertMany(matchesToCreate);
    console.log(`Seed: SUCCÈS - ${matchesToCreate.length} matchs insérés !`);

  } catch (error) { console.error("Seed: ERREUR:", error); } 
  finally { mongoose.connection.close(); }
};
seedDatabase();