require('dotenv').config(); // Charge les variables d'environnement depuis .env
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Importe la librairie Google Generative AI
const fs = require("fs"); // Importe le module fs (file system) pour lire des fichiers
const yargs = require('yargs'); // Importe la librairie yargs pour gérer les arguments de ligne de commande
const { hideBin } = require('yargs/helpers'); // Importe hideBin pour nettoyer les arguments

// 🔒 Récupérer la clé API depuis les variables d’environnement
const apiKey = process.env.GEMINI_API_KEY;

// Vérifie si la clé API Gemini est définie
if (!apiKey) {
    console.error("❌ ERREUR : La clé API Gemini n'est pas définie !");
    process.exit(1); // Quitte le script si la clé n'est pas définie
}

const genAI = new GoogleGenerativeAI(apiKey); // Initialise l'API Gemini

/**
 * Fonction asynchrone pour générer un tableau JSON de films à partir d'un fichier JSON.
 * @param {string} jsonFileName - Le nom du fichier JSON à traiter.
 */
async function generateSQLfromJSON(jsonFileName) {
    try {
        // Lit le contenu du fichier JSON spécifié et le parse en objet JavaScript
        const jsonData = JSON.parse(fs.readFileSync(jsonFileName, "utf8"));

        // Affiche le contenu du fichier JSON après la lecture (pour vérification)
        console.log("✅ Contenu du fichier " + jsonFileName + " après la lecture :", JSON.stringify(jsonData, null, 2));

        // Définit le prompt (la question) pour l'API Gemini
        const prompt = `
        Transforme ces données JSON en un tableau JSON. Chaque élément du tableau doit contenir les données d'un film, avec les clés suivantes :
        nom, dateDeSortie, realisateur, notePublic, note, compagnie, description, origine, lienImage.

        Voici les données JSON des films :
        ${JSON.stringify(jsonData, null, 2)}
        `;

        // Obtient le modèle génératif Gemini Pro
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Génère du contenu à partir du prompt
        const result = await model.generateContent(prompt);

        // Obtient la réponse de l'API
        const response = await result.response;

        // Extrait le contenu textuel de la réponse
        const jsonOutput = response.text();

        // Affiche la sortie JSON générée par l'API Gemini
        console.log("✅ Données JSON générées :\n", jsonOutput);

        // Enregistre la sortie JSON dans un fichier (optionnel)
        fs.writeFileSync("films_data.json", jsonOutput, "utf8");

    } catch (error) {
        console.error("❌ Erreur lors de la génération SQL :", error);
    }
}

// Configure yargs pour gérer l'argument du nom de fichier
const argv = yargs(hideBin(process.argv))
    .option('file', {
        alias: 'f',
        describe: 'Nom du fichier JSON à traiter',
        type: 'string',
        demandOption: true, // Oblige à fournir le nom de fichier
    })
    .parse();

// Appelle la fonction generateSQLfromJSON avec le nom de fichier fourni en argument
generateSQLfromJSON(argv.file);