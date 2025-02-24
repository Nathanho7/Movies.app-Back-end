const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

// 📀 Ouvrir la base de données SQLite
const db = new sqlite3.Database("./films.db");

// 📄 Lire les fichiers JSON générés par `generateSQL.js`
const jsonFiles = ["films_data1.json", "films_data2.json"]; // Tableau des noms de fichiers

let allFilmsData = []; // Tableau pour stocker tous les films

// Fonction pour lire et parser un fichier JSON
function readAndParseJSON(jsonFile) {
    if (!fs.existsSync(jsonFile)) {
        console.error(`❌ ERREUR : Le fichier JSON ${jsonFile} n'existe pas !`);
        process.exit(1);
    }

    try {
        let jsonString = fs.readFileSync(jsonFile, "utf8");
        // 🔥 Supprimer les balises de code, les virgules en trop et les espaces inutiles
        jsonString = jsonString.replace(/```json\n|```/g, '');
        jsonString = jsonString.replace(/,\s*]/g, ']');
        jsonString = jsonString.replace(/,\s*}/g, '}');

        const jsonData = JSON.parse(jsonString);
        console.log(`✅ Nombre de films lus depuis ${jsonFile} :`, jsonData.length);
        return jsonData;
    } catch (error) {
        console.error(`❌ Erreur lors de l'analyse du JSON ${jsonFile} :`, error);
        process.exit(1);
    }
}

// Lire et parser chaque fichier JSON
jsonFiles.forEach(jsonFile => {
    const filmsData = readAndParseJSON(jsonFile);
    allFilmsData = allFilmsData.concat(filmsData); // Concaténer les tableaux de films
});

console.log("✅ Nombre total de films lus :", allFilmsData.length);

// 🔄 Insérer chaque film dans la base de données
db.serialize(() => {
    allFilmsData.forEach(film => {
        const { nom, dateDeSortie, realisateur, notePublic, note, compagnie, description, origine, lienImage } = film;

        const query = `INSERT INTO movies (nom, dateDeSortie, realisateur, notePublic, note, compagnie, description, origine, lienImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(query, [nom, dateDeSortie, realisateur, notePublic, note, compagnie, description, origine, lienImage], (err) => {
            if (err) {
                console.error("❌ Erreur lors de l'insertion :", err);
            } else {
                console.log("✅ Film ajouté avec succès !");
            }
        });
    });
});

// 🔒 Fermer la base de données après insertion
db.close(() => {
    console.log("🔒 Base de données fermée.");
});