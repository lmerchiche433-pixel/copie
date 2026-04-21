const jwt = require('jsonwebtoken');

/**
 * Middleware : vérifie que le token JWT est valide.
 * Ajoute req.user = { id, role } si OK.
 */
const verifierToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ erreur: 'Token manquant — accès refusé' });
  }

  const token = authHeader.split(' ')[1]; // format : "Bearer <token>"
  if (!token) {
    return res.status(401).json({ erreur: 'Format de token invalide' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ erreur: 'Token expiré ou invalide' });
  }
};

/**
 * Middleware : autorise uniquement les hôtes.
 * À utiliser APRÈS verifierToken.
 */
const estHote = (req, res, next) => {
  if (req.user.role !== 'hote') {
    return res.status(403).json({ erreur: 'Accès réservé aux hôtes' });
  }
  next();
};

module.exports = { verifierToken, estHote };