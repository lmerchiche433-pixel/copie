const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crée le dossier uploads/logements s'il n'existe pas
const dossierUpload = path.join(__dirname, '..', '..', 'uploads', 'logements');
if (!fs.existsSync(dossierUpload)) {
  fs.mkdirSync(dossierUpload, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dossierUpload);
  },
  filename: (req, file, cb) => {
    // ex: logement_1714500000000_photo.jpg
    const nomFichier = `logement_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, nomFichier);
  }
});

const filtreImage = (req, file, cb) => {
  const typesAcceptes = ['image/jpeg', 'image/png', 'image/webp'];
  if (typesAcceptes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non accepté. Utilisez JPG, PNG ou WEBP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: filtreImage,
  limits: {
    fileSize: 5 * 1024 * 1024,   // 5 Mo max par photo
    files: 10                     // 10 photos max
  }
});

module.exports = upload;