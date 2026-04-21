const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifierToken, estHote } = require('../middlewares/ann');
const upload = require('../middlewares/upload');
const { validerAnnonce } = require('../middlewares/validerAnnonce');
 

router.post(
  '/',
  verifierToken,          // 1. Vérifie le JWT
  estHote,                // 2. Vérifie que l'utilisateur est un hôte
  upload.array('photos'), // 3. Traite les fichiers images
  validerAnnonce,         // 4. Valide le formulaire
  async (req, res) => {
 
    const {
      titre, description, type_logement, adresse,
      latitude, longitude,
      nb_chambres, nb_lits, nb_salles_de_bain,
      capacite_accueil, prix_par_nuit,
      equipements
    } = req.body;
 
    const id_hote = req.user.id; // extrait du JWT
 
    // Transaction : tout s'insère ou rien ne s'insère
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
 
      // 1. Insertion du logement
      const resLogement = await client.query(
        `INSERT INTO logement
           (id_hote, titre, description, type_logement, adresse,
            latitude, longitude, nb_chambres, nb_lits,
            nb_salles_de_bain, capacite_accueil, prix_par_nuit)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
          id_hote,
          titre.trim(),
          description.trim(),
          type_logement,
          adresse.trim(),
          latitude  || null,
          longitude || null,
          Number(nb_chambres),
          Number(nb_lits),
          Number(nb_salles_de_bain),
          Number(capacite_accueil),
          Number(prix_par_nuit)
        ]
      );
 
      const logement = resLogement.rows[0];
      const id_logement = logement.id;
 
      // 2. Insertion des photos
      const urlPhotos = [];
      for (const fichier of req.files) {
        // URL publique servie par express.static
        const urlPhoto = `/uploads/logements/${fichier.filename}`;
        await client.query(
          `INSERT INTO logement_photo (id_logement, url_photo) VALUES ($1, $2)`,
          [id_logement, urlPhoto]
        );
        urlPhotos.push(urlPhoto);
      }
 
      // 3. Insertion des équipements
      const listeEquipements = equipements
        ? (typeof equipements === 'string' ? JSON.parse(equipements) : equipements)
        : [];
 
      for (const eq of listeEquipements) {
        if (typeof eq === 'string' && eq.trim()) {
          await client.query(
            `INSERT INTO logement_equipement (id_logement, nom_equipement)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [id_logement, eq.trim().toLowerCase()]
          );
        }
      }
 
      await client.query('COMMIT');
 
      // Réponse complète
      res.status(201).json({
        message: 'Annonce créée avec succès ✅',
        logement: {
          ...logement,
          photos: urlPhotos,
          equipements: listeEquipements
        }
      });
 
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Erreur création annonce :', err.message);
      res.status(500).json({ erreur: 'Erreur serveur lors de la création de l\'annonce.' });
    } finally {
      client.release();
    }
  }
);
 
/**
 * GET /api/annonces/mes-annonces
 * Retourne les annonces du hôte connecté.
 */
router.get('/mes-annonces', verifierToken, estHote, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*,
         ARRAY_AGG(DISTINCT p.url_photo)      AS photos,
         ARRAY_AGG(DISTINCT e.nom_equipement) AS equipements
       FROM logement l
       LEFT JOIN logement_photo     p ON l.id = p.id_logement
       LEFT JOIN logement_equipement e ON l.id = e.id_logement
       WHERE l.id_hote = $1
       GROUP BY l.id
       ORDER BY l.date_creation DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});
 
/**
 * PATCH /api/annonces/:id/statut
 * Active ou désactive une annonce (est_actif toggle).
 */
router.patch('/:id/statut', verifierToken, estHote, async (req, res) => {
  const { est_actif } = req.body;
  if (typeof est_actif !== 'boolean') {
    return res.status(400).json({ erreur: 'est_actif doit être true ou false.' });
  }
  try {
    // Vérifie que l'annonce appartient bien à ce hôte
    const check = await pool.query(
      'SELECT id FROM logement WHERE id = $1 AND id_hote = $2',
      [req.params.id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ erreur: 'Annonce introuvable ou accès refusé.' });
    }
 
    const result = await pool.query(
      'UPDATE logement SET est_actif = $1 WHERE id = $2 RETURNING id, titre, est_actif',
      [est_actif, req.params.id]
    );
    res.json({ message: 'Statut mis à jour.', logement: result.rows[0] });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});
 
/**
 * DELETE /api/annonces/:id
 * Supprime une annonce du hôte connecté.
 */
router.delete('/:id', verifierToken, estHote, async (req, res) => {
  try {
    const check = await pool.query(
      'SELECT id FROM logement WHERE id = $1 AND id_hote = $2',
      [req.params.id, req.user.id]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ erreur: 'Annonce introuvable ou accès refusé.' });
    }
    await pool.query('DELETE FROM logement WHERE id = $1', [req.params.id]);
    res.json({ message: 'Annonce supprimée ✅' });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});
 
module.exports = router;