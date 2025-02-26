const express = require('express');
const db = require('./db'); // Connexion à la base de données SQLite
const app = express();
const port = process.env.PORT || 80;
const cors = require('cors');

// 📌 Middleware pour parser le JSON
app.use(express.json());
app.use(cors());

// 📌 Route GET - Récupérer tous les films avec filtres
app.get('/api/films', (req, res) => {
    const { origine, niveau, noteMin, noteMax } = req.query;
    let sql = 'SELECT * FROM movies WHERE 1=1';
    const params = [];

    if (origine && origine !== "TOUS") {
        sql += ' AND origine = ?';
        params.push(origine);
    }

    if (niveau) {
        switch (niveau) {
            case 'Classic':
                sql += ' AND note >= 4.2';
                break;
            case 'Standard':
                sql += ' AND note >= 2 AND note < 4.2';
                break;
            case 'Navet':
                sql += ' AND note < 2';
                break;
        }
    }

    if (noteMin) {
        sql += ' AND note >= ?';
        params.push(parseFloat(noteMin));
    }

    if (noteMax) {
        sql += ' AND note <= ?';
        params.push(parseFloat(noteMax));
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erreur lors de la récupération des films' });
        } else {
            res.json(rows);
        }
    });
});

// 📌 Route POST - Ajouter un nouveau film
app.post('/api/films', (req, res) => {
    const { nom, dateDeSortie, realisateur, notePublic, note, compagnie, description, origine, lienImage } = req.body;

    // Vérifie que la date de sortie est une année valide (4 chiffres)
    if (!/^\d{4}$/.test(dateDeSortie)) {
        return res.status(400).json({ error: "La date de sortie doit être une année valide (ex: 1960)" });
    }

    const query = `
        INSERT INTO movies (nom, dateDeSortie, realisateur, notePublic, note, compagnie, description, origine, lienImage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [nom, dateDeSortie, realisateur, notePublic, note, compagnie, description, origine, lienImage], function (err) {
        if (err) {
            console.error("Erreur lors de l'ajout du film :", err);
            res.status(500).json({ error: "Erreur lors de l'ajout du film" });
        } else {
            res.status(201).json({ message: "Film ajouté avec succès", id: this.lastID });
        }
    });
});

// 📌 Route PUT - Modifier un film existant
app.put('/api/films/:id', (req, res) => {
    const { id } = req.params;
    const { nom, dateDeSortie, realisateur, notePublic, note, compagnie, description, origine, lienImage } = req.body;

    // Vérifie que la date de sortie est une année valide (4 chiffres)
    if (!/^\d{4}$/.test(dateDeSortie)) {
        return res.status(400).json({ error: "La date de sortie doit être une année valide (ex: 1960)" });
    }

    const query = `UPDATE movies SET 
        nom = ?, dateDeSortie = ?, realisateur = ?, 
        notePublic = ?, note = ?, compagnie = ?, 
        description = ?, origine = ?, lienImage = ?
        WHERE id = ?`;

    db.run(query, [nom, dateDeSortie, realisateur, notePublic, note, compagnie, description, origine, lienImage, id], function (err) {
        if (err) {
            console.error("Erreur SQL :", err); // Log pour identifier l'erreur
            res.status(500).json({ error: 'Erreur lors de la modification du film' });
        } else {
            console.log("Film modifié avec succès :", this.lastID); // Log pour confirmer la modification
            res.status(200).json({ message: 'Film modifié avec succès' });
        }
    });
});

// 📌 Route DELETE - Supprimer un film
app.delete('/api/films/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM movies WHERE id = ?', [id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erreur lors de la suppression du film' });
        } else {
            res.status(204).send();
        }
    });
});

// 📌 Démarrer le serveur
app.listen(port, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${port}`);
});