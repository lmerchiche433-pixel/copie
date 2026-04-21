/**
 * Valide les données du formulaire "Créer une annonce".
 * Retourne une liste d'erreurs si les champs sont invalides.
 */
const validerAnnonce = (req, res, next) => {
  const {
    titre,
    description,
    type_logement,
    adresse,
    nb_chambres,
    nb_lits,
    nb_salles_de_bain,
    capacite_accueil,
    prix_par_nuit,
    equipements   // JSON string ou tableau
  } = req.body;
 
  const erreurs = [];
 
  // --- Champs texte obligatoires ---
  if (!titre || titre.trim().length < 5) {
    erreurs.push('Le titre doit contenir au moins 5 caractères.');
  }
  if (titre && titre.trim().length > 255) {
    erreurs.push('Le titre ne peut pas dépasser 255 caractères.');
  }
  if (!description || description.trim().length < 20) {
    erreurs.push('La description doit contenir au moins 20 caractères.');
  }
 
  const typesValides = ['appartement', 'maison', 'chambre', 'villa', 'chalet'];
  if (!type_logement || !typesValides.includes(type_logement)) {
    erreurs.push(`Type de logement invalide. Valeurs acceptées : ${typesValides.join(', ')}.`);
  }
 
  if (!adresse || adresse.trim().length < 5) {
    erreurs.push("L'adresse est obligatoire.");
  }
 
  // --- Champs numériques ---
  const champNumeriques = {
    nb_chambres: { valeur: nb_chambres, min: 0, max: 50, label: 'Nombre de chambres' },
    nb_lits:     { valeur: nb_lits,     min: 0, max: 99, label: 'Nombre de lits' },
    nb_salles_de_bain: { valeur: nb_salles_de_bain, min: 0, max: 20, label: 'Nombre de salles de bain' },
    capacite_accueil:  { valeur: capacite_accueil,  min: 1, max: 50, label: "Capacité d'accueil" },
    prix_par_nuit:     { valeur: prix_par_nuit,      min: 1, max: 1000000, label: 'Prix par nuit' },
  };
 
  for (const [cle, { valeur, min, max, label }] of Object.entries(champNumeriques)) {
    const n = Number(valeur);
    if (valeur === undefined || valeur === null || valeur === '') {
      erreurs.push(`${label} est obligatoire.`);
    } else if (isNaN(n) || !Number.isInteger(n)) {
      erreurs.push(`${label} doit être un nombre entier.`);
    } else if (n < min || n > max) {
      erreurs.push(`${label} doit être compris entre ${min} et ${max}.`);
    }
  }
 
  // --- Photos (au moins 1 requise) ---
  if (!req.files || req.files.length === 0) {
    erreurs.push('Veuillez ajouter au moins une photo.');
  }
 
  // --- Équipements (optionnel, doit être tableau JSON) ---
  if (equipements) {
    try {
      const eq = typeof equipements === 'string' ? JSON.parse(equipements) : equipements;
      if (!Array.isArray(eq)) {
        erreurs.push('Les équipements doivent être une liste.');
      }
    } catch {
      erreurs.push('Format des équipements invalide.');
    }
  }
 
  if (erreurs.length > 0) {
    return res.status(400).json({ erreurs });
  }
 
  next();
};
 
module.exports = { validerAnnonce };
 