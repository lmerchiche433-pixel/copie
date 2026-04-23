import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, MapPin, CheckCircle } from 'lucide-react';
import { logementController } from '@algbnb/core';
const { creerLogement } = logementController;

export const PageCreerAnnonce = () => {
  const navigate = useNavigate();

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [typeLogement, setTypeLogement] = useState('');
  const [adresse, setAdresse] = useState('');
  const [prix, setPrix] = useState('');
  const [chambres, setChambres] = useState(2);
  const [lits, setLits] = useState(3);
  const [sallesDeBain, setSallesDeBain] = useState(1);
  const [voyageurs, setVoyageurs] = useState(4);
  const [equipements, setEquipements] = useState({ wifi: false, cuisine: false, piscine: false, parking: false });
  const [photos, setPhotos] = useState([]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const toggleEquipement = (key) => setEquipements(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async () => {
    setErreur('');

    // Validation
    if (!titre || !description || !typeLogement || !adresse || !prix) {
      setErreur('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setChargement(true);
    try {
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('description', description);
      formData.append('type_logement', typeLogement);
      formData.append('adresse', adresse);
      formData.append('prix_par_nuit', prix);
      formData.append('nb_chambres', chambres);
      formData.append('nb_lits', lits);
      formData.append('nb_salles_de_bain', sallesDeBain);
      formData.append('capacite_accueil', voyageurs);

      const equipementsSelectionnes = Object.keys(equipements).filter(k => equipements[k]);
      formData.append('equipements', JSON.stringify(equipementsSelectionnes));

      for (const photo of photos) {
        formData.append('photos', photo);
      }

      await creerLogement(formData);
      alert('Annonce créée avec succès ✅');
      navigate('/dashboard-hote');
    } catch (err) {
      setErreur(err.message || 'Erreur lors de la création de l\'annonce.');
    } finally {
      setChargement(false);
    }
  };

  const Counter = ({ label, value, setValue }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-4) 0', borderBottom: '1px solid var(--surface-high)' }}>
      <span style={{ fontSize: 'var(--body-md)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
        <button
          onClick={() => setValue(Math.max(0, value - 1))}
          style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: value > 0 ? 'var(--surface-low)' : 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: value > 0 ? 'pointer' : 'not-allowed', opacity: value > 0 ? 1 : 0.4, border: 'none' }}
        >−</button>
        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{value}</span>
        <button
          onClick={() => setValue(value + 1)}
          style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
        >+</button>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="page-container" style={{ flex: 1, marginTop: 'var(--spacing-16)', maxWidth: '800px', paddingBottom: 'var(--spacing-16)' }}>

        <header style={{ marginBottom: 'var(--spacing-12)' }}>
          <h1 style={{ fontSize: 'var(--display-md)', letterSpacing: '-0.02em', marginBottom: 'var(--spacing-4)', lineHeight: 1.1 }}>
            Publiez votre logement
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--headline-md)' }}>Créez une annonce d'exception en quelques étapes.</p>
        </header>

        {erreur && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-DEFAULT)', marginBottom: 'var(--spacing-4)' }}>
            {erreur}
          </div>
        )}

        <section style={{ backgroundColor: 'var(--surface-lowest)', padding: 'var(--spacing-8)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>

          {/* Informations générales */}
          <div>
            <h2 style={{ fontSize: 'var(--title-lg)', marginBottom: 'var(--spacing-4)' }}>Informations générales</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <input
                type="text"
                placeholder="Titre de l'annonce (ex: Villa de rêve avec vue mer)"
                value={titre}
                onChange={e => setTitre(e.target.value)}
                style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-DEFAULT)', border: '1px solid var(--outline-variant)', fontSize: 'var(--body-md)', width: '100%' }}
              />
              <textarea
                placeholder="Description détaillée de votre bien..."
                rows="4"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-DEFAULT)', border: '1px solid var(--outline-variant)', fontSize: 'var(--body-md)', width: '100%', resize: 'vertical' }}
              ></textarea>
              <select
                value={typeLogement}
                onChange={e => setTypeLogement(e.target.value)}
                style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-DEFAULT)', border: '1px solid var(--outline-variant)', fontSize: 'var(--body-md)', width: '100%', backgroundColor: 'transparent' }}
              >
                <option value="">Sélectionnez le type de bien</option>
                <option value="appartement">Appartement</option>
                <option value="maison">Maison / Villa</option>
                <option value="chambre">Chambre privée</option>
              </select>
              <input
                type="number"
                placeholder="Prix par nuit (DZD)"
                value={prix}
                onChange={e => setPrix(e.target.value)}
                style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-DEFAULT)', border: '1px solid var(--outline-variant)', fontSize: 'var(--body-md)', width: '100%' }}
              />
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h2 style={{ fontSize: 'var(--title-lg)', marginBottom: 'var(--spacing-4)' }}>Capacité et Configuration</h2>
            <div style={{ border: '1px solid var(--surface-high)', borderRadius: 'var(--radius-DEFAULT)', padding: '0 var(--spacing-4)' }}>
              <Counter label="Capacité d'accueil (voyageurs)" value={voyageurs} setValue={setVoyageurs} />
              <Counter label="Chambres" value={chambres} setValue={setChambres} />
              <Counter label="Lits" value={lits} setValue={setLits} />
              <Counter label="Salles de bain" value={sallesDeBain} setValue={setSallesDeBain} />
            </div>
          </div>

          {/* Équipements */}
          <div>
            <h2 style={{ fontSize: 'var(--title-lg)', marginBottom: 'var(--spacing-4)' }}>Équipements inclus</h2>
            <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
              {Object.keys(equipements).map(eq => (
                <button
                  key={eq}
                  onClick={() => toggleEquipement(eq)}
                  style={{
                    padding: 'var(--spacing-3) var(--spacing-6)',
                    borderRadius: 'var(--radius-full)',
                    border: equipements[eq] ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                    backgroundColor: equipements[eq] ? 'var(--primary-container)' : 'transparent',
                    color: equipements[eq] ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontWeight: equipements[eq] ? 'bold' : 'normal',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  {equipements[eq] && <CheckCircle size={16} />} {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Localisation */}
          <div>
            <h2 style={{ fontSize: 'var(--title-lg)', marginBottom: 'var(--spacing-4)' }}>Localisation</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-DEFAULT)', border: '1px solid var(--outline-variant)' }}>
              <MapPin size={24} color="var(--on-surface-variant)" />
              <input
                type="text"
                placeholder="Adresse complète"
                value={adresse}
                onChange={e => setAdresse(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: 'var(--body-md)', background: 'transparent' }}
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <h2 style={{ fontSize: 'var(--title-lg)', marginBottom: 'var(--spacing-4)' }}>Photos</h2>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => setPhotos(Array.from(e.target.files))}
              style={{ marginBottom: 'var(--spacing-4)' }}
            />
            {photos.length > 0 && (
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}>
                {photos.length} photo(s) sélectionnée(s)
              </p>
            )}
          </div>

        </section>

        <div style={{ marginTop: 'var(--spacing-12)', display: 'flex', gap: 'var(--spacing-4)' }}>
          <button className="btn-outline" onClick={() => navigate(-1)} style={{ flex: 1, padding: 'var(--spacing-4)' }}>
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={chargement}
            style={{ flex: 2, padding: 'var(--spacing-4)', opacity: chargement ? 0.7 : 1 }}
          >
            {chargement ? 'Publication en cours...' : "Publier l'annonce"}
          </button>
        </div>

      </div>

      <footer style={{ padding: 'var(--spacing-6) 0', borderTop: '1px solid var(--surface-high)', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)', marginTop: 'auto' }}>
        <p style={{ marginBottom: 'var(--spacing-4)' }}>© 2024 algbnb. Tous droits réservés.</p>
        <Link to="#" className="footer-link">Confidentialité</Link>
        <Link to="#" className="footer-link">Conditions</Link>
        <Link to="#" className="footer-link" style={{marginRight: 0}}>Aide</Link>
      </footer>

    </div>
  );
};
