import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { logementController } from '@algbnb/core';
import { Navbar } from '../components/Navbar';
import { BottomNavBar } from '../components/BottomNavBar';
import { Star, Heart, Share2, MapPin, Users, BedDouble, Bath, Wifi, Car, ChefHat, Snowflake, Waves, ArrowLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001/api';

export const PageLogement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [logement, setLogement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [dateArrivee, setDateArrivee] = useState(null);
  const [dateDepart, setDateDepart] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);

  const nuits = dateArrivee && dateDepart
    ? Math.max(1, Math.ceil((dateDepart - dateArrivee) / (1000 * 60 * 60 * 24)))
    : 0;

  const prixNuit = logement?.prix_par_nuit || 0;
  const sousTotal = nuits * prixNuit;
  const fraisService = Math.round(sousTotal * 0.12);
  const total = sousTotal + fraisService;

  useEffect(() => {
    const fetchLogement = async () => {
      try {
        const data = await logementController.getLogementById(id);
        setLogement(data);
      } catch (err) {
        console.error('Erreur chargement logement:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogement();
  }, [id]);

  const handleReserve = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!dateArrivee || !dateDepart) {
      alert('Veuillez sélectionner vos dates');
      return;
    }
    navigate('/paiement', {
      state: {
        logement,
        dateArrivee,
        dateDepart,
        nuits,
        sousTotal,
        fraisService,
        total
      }
    });
  };

  const handleContact = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (user.role_type !== 'voyageur') {
      alert('Seuls les voyageurs peuvent contacter un hôte.');
      return;
    }

    setContactLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Chercher si une conversation existe déjà
      const resConvs = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const convs = await resConvs.json();

      const existante = Array.isArray(convs)
        ? convs.find(c => c.id_logement === parseInt(id))
        : null;

      if (existante) {
        navigate('/messages', { state: { conversationId: existante.id } });
        return;
      }

      // Créer une nouvelle conversation
      const res = await fetch(`${API_URL}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_logement: parseInt(id),
          id_hote: logement.id_hote
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.erreur || 'Erreur création conversation');
      }

      const conv = await res.json();
      navigate('/messages', { state: { conversationId: conv.id } });
    } catch (err) {
      console.error('Erreur contact hôte:', err);
      alert('Erreur : ' + err.message);
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Chargement...</p>
    </div>
  );

  if (!logement) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p>Logement introuvable</p>
      <Link to="/">Retour à l'accueil</Link>
    </div>
  );

  const photos = Array.isArray(logement.photos) ? logement.photos : [];
  const mainPhoto = photos[0]
    ? `http://localhost:3001${photos[0]}`
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';

  const equipements = Array.isArray(logement.equipements) ? logement.equipements : [];

  const iconMap = {
    'WiFi': <Wifi size={18} />,
    'Parking': <Car size={18} />,
    'Cuisine': <ChefHat size={18} />,
    'Climatisation': <Snowflake size={18} />,
    'Piscine': <Waves size={18} />,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface)', paddingBottom: '80px' }}>
      <Navbar />

      {/* Header actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--spacing-4) var(--spacing-6)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--body-md)' }}>
          <ArrowLeft size={18} /> Retour
        </button>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <button onClick={() => setIsFav(!isFav)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)', fontWeight: '600' }}>
            <Heart size={16} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : 'currentColor'} />
            Sauvegarder
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)', fontWeight: '600' }}>
            <Share2 size={16} /> Partager
          </button>
        </div>
      </div>

      {/* Main photo */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '480px' }}>
          <img
            src={mainPhoto}
            alt={logement.titre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        {/* Miniatures */}
        {photos.length > 1 && (
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
            {photos.slice(1, 4).map((p, i) => (
              <div key={i} style={{ flex: 1, height: '100px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <img src={`http://localhost:3001${p}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--spacing-6)', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--spacing-10)' }}>
        {/* Left */}
        <div>
          <h1 style={{ fontSize: 'var(--title-xl)', fontWeight: '700', marginBottom: 'var(--spacing-2)' }}>
            {logement.titre}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)', color: 'var(--on-surface-variant)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> {logement.adresse}
            </span>
            <span>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" /> {logement.note_moyenne || '4.8'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)', padding: 'var(--spacing-4)', backgroundColor: 'var(--surface-variant)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} /> {logement.capacite_accueil} voyageurs
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BedDouble size={18} /> {logement.nombre_chambres || 1} chambre(s)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bath size={18} /> {logement.nombre_salles_bain || 1} sdb
            </div>
          </div>

          {/* Hôte */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-4)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-8)' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <img src={logement.hote?.photo || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80'} alt="Hôte" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--body-md)', fontWeight: '700' }}>Hôte : {logement.hote?.nom || 'Hôte'}</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}>
                {logement.type_logement}
              </p>
            </div>
          </div>

          {/* Description */}
          <h2 style={{ fontSize: 'var(--title-lg)', fontWeight: '700', marginBottom: 'var(--spacing-3)' }}>À propos</h2>
          <p style={{ lineHeight: 1.7, color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-8)' }}>
            {logement.description}
          </p>

          {/* Équipements */}
          {equipements.length > 0 && (
            <>
              <h2 style={{ fontSize: 'var(--title-lg)', fontWeight: '700', marginBottom: 'var(--spacing-4)' }}>Équipements</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-8)' }}>
                {equipements.map((eq, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: 'var(--spacing-3)', backgroundColor: 'var(--surface-variant)', borderRadius: 'var(--radius-md)' }}>
                    {iconMap[eq] || <Wifi size={18} />}
                    <span style={{ fontSize: 'var(--body-sm)' }}>{eq}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right — Booking card */}
        <div>
          <div style={{
            position: 'sticky',
            top: '100px',
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--outline-variant)',
            padding: 'var(--spacing-6)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}>
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <span style={{ fontSize: 'var(--title-lg)', fontWeight: '800' }}>{logement.prix_par_nuit} DZD</span>
              <span style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}> / nuit</span>
            </div>

            {/* Date pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--label-sm)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>ARRIVÉE</label>
                <DatePicker
                  selected={dateArrivee}
                  onChange={date => setDateArrivee(date)}
                  selectsStart
                  startDate={dateArrivee}
                  endDate={dateDepart}
                  minDate={new Date()}
                  placeholderText="Date"
                  dateFormat="dd/MM/yyyy"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--label-sm)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>DÉPART</label>
                <DatePicker
                  selected={dateDepart}
                  onChange={date => setDateDepart(date)}
                  selectsEnd
                  startDate={dateArrivee}
                  endDate={dateDepart}
                  minDate={dateArrivee || new Date()}
                  placeholderText="Date"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            {/* Calcul */}
            {nuits > 0 && (
              <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)', fontSize: 'var(--body-sm)' }}>
                  <span style={{ textDecoration: 'underline' }}>{prixNuit} DZD x {nuits} nuits</span>
                  <span>{sousTotal.toLocaleString()} DZD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-4)', fontSize: 'var(--body-sm)' }}>
                  <span style={{ textDecoration: 'underline' }}>Frais de service Algbnb</span>
                  <span>{fraisService.toLocaleString()} DZD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderTop: '1px solid var(--outline-variant)', paddingTop: 'var(--spacing-3)' }}>
                  <span>Total</span>
                  <span>{total.toLocaleString()} DZD</span>
                </div>
              </div>
            )}

            {/* Bouton Réserver */}
            <button
              className="btn-primary"
              style={{ width: '100%', padding: 'var(--spacing-4)', fontSize: '1.05rem', marginBottom: 'var(--spacing-3)' }}
              onClick={handleReserve}
            >
              Réserver
            </button>

            {/* Bouton Contacter l'hôte */}
            <button
              className="btn-outline"
              style={{ width: '100%', padding: 'var(--spacing-4)', fontSize: '1rem', opacity: contactLoading ? 0.7 : 1, cursor: contactLoading ? 'not-allowed' : 'pointer' }}
              onClick={handleContact}
              disabled={contactLoading}
            >
              {contactLoading ? 'Chargement...' : "Contacter l'hôte"}
            </button>

            <p style={{ textAlign: 'center', fontSize: 'var(--label-sm)', color: 'var(--on-surface-variant)', marginTop: 'var(--spacing-3)' }}>
              Vous ne serez débité qu'après confirmation
            </p>
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};
