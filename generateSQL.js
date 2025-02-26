require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ ERREUR : La clé API Gemini n'est pas définie !");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function generateSQLfromJSON(jsonFileName) {
    try {
        const jsonData = JSON.parse(fs.readFileSync(jsonFileName, "utf8"));
        console.log("✅ Contenu du fichier " + jsonFileName + " après la lecture :", JSON.stringify(jsonData, null, 2));

        const prompt = `
        Transforme ces données JSON en un tableau JSON. Chaque élément du tableau doit contenir les données d'un film, avec les clés suivantes :
        nom, dateDeSortie, realisateur, notePublic, note, compagnie, description, origine, lienImage.

        Voici les données JSON des films :
        ${JSON.stringify(jsonData, null, 2)}

        Réponds uniquement avec les données JSON transformées, sans explication.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }, { apiVersion: 'v1beta' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonOutput = response.text();

        // Vérifie si la réponse contient des commentaires et les supprime
        const jsonOutputCleaned = jsonOutput.replace(/Le JSON fourni.*$/, '').trim();

        // Génère le nom du fichier de sortie en remplaçant "part" par "data"
        const outputFileName = jsonFileName.replace('part', 'data');

        console.log("✅ Données JSON générées :\n", jsonOutputCleaned);
        fs.writeFileSync(outputFileName, jsonOutputCleaned, "utf8");

    } catch (error) {
        console.error("❌ Erreur lors de la génération SQL :", error);
    }
}

const argv = yargs(hideBin(process.argv))
    .option('file', {
        alias: 'f',
        describe: 'Nom du fichier JSON à traiter',
        type: 'string',
        demandOption: true,
    })
    .parse();

generateSQLfromJSON(argv.file);