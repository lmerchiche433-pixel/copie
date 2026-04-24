import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { BottomNavBar } from '../components/BottomNavBar';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { reservationController } from '@algbnb/core';
import { useAuth } from '../context/AuthContext';

export const PageMesReservations = () => {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchReservations = async () => {
      try {
        const data = await reservationController.getReservationsVoyageur(user.id);
        setReservations(data);
      } catch (err) {
        setErreur(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [user]);

  const handleAnnuler = async (id) => {
    if (!window.confirm('Voulez-vous annuler cette réservation ?')) return;
    try {
      await reservationController.annulerReservation(id);
      setReservations(reservations.map(r => r.id === id ? { ...r, statut: 'annulee' } : r));
    } catch (err) {
      alert('Erreur lors de l\'annulation');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="page-container" style={{ flex: 1, marginTop: 'var(--spacing-16)' }}>
        <header style={{ marginBottom: 'var(--spacing-16)' }}>
          <h1 style={{ fontSize: 'var(--display-md)', letterSpacing: '-0.02em', marginBottom: 'var(--spacing-4)', lineHeight: 1.1 }}>
            Mes Voyages
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--headline-md)' }}>
            Gérez vos réservations passées et à venir.
          </p>
        </header>

        {loading ? (
          <div className="spinner"></div>
        ) : erreur ? (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-DEFAULT)' }}>
            {erreur}
          </div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', backgroundColor: 'var(--surface-lowest)', padding: 'var(--spacing-12)', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: 'var(--title-lg)', marginBottom: 'var(--spacing-4)' }}>Aucune réservation pour le moment.</h3>
            <p style={{ color: 'var(--on-surface-variant)' }}>Il est temps de planifier votre prochaine aventure !</p>
            <button className="btn-primary" style={{ marginTop: 'var(--spacing-8)' }} onClick={() => navigate('/')}>
              Commencer l'exploration
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
            {reservations.map(res => (
              <div
                key={res.id}
                style={{ display: 'flex', gap: 'var(--spacing-6)', paddingBottom: 'var(--spacing-8)', borderBottom: '1px solid var(--surface-high)' }}
              >
                {/* Photo */}
                <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-DEFAULT)', backgroundColor: 'var(--surface-high)', overflow: 'hidden', flexShrink: 0 }}
                  onClick={() => navigate(`/logement/${res.id_logement}`)}
                >
                  {res.photos?.[0] && res.photos[0] !== 'null' ? (
                    <img src={`http://localhost:3001${res.photos[0]}`} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--surface-high)' }} />
                  )}
                </div>

                {/* Infos */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 'var(--title-lg)', fontWeight: 'bold', marginBottom: 'var(--spacing-2)', cursor: 'pointer' }}
                    onClick={() => navigate(`/logement/${res.id_logement}`)}
                  >
                    {res.titre}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>
                    <Calendar size={16} />
                    <span>{res.date_arrivee} → {res.date_depart}</span>
                  </div>
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)', marginBottom: 'var(--spacing-2)' }}>
                    {res.nb_voyageurs} voyageur(s) • {res.adresse}
                  </p>
                  <p style={{ fontWeight: 'bold', marginBottom: 'var(--spacing-2)' }}>
                    {res.montant_total} DZD
                  </p>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '12px',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: res.statut === 'confirmee' ? 'var(--primary-container)' : res.statut === 'annulee' ? '#fee2e2' : 'var(--surface-high)',
                    color: res.statut === 'confirmee' ? 'var(--on-primary-container)' : res.statut === 'annulee' ? '#dc2626' : 'var(--on-surface-variant)'
                  }}>
                    {res.statut}
                  </span>
                </div>

                {/* Bouton annuler */}
                {res.statut !== 'annulee' && (
                  <button
                    onClick={() => handleAnnuler(res.id)}
                    style={{ alignSelf: 'center', padding: '8px 16px', borderRadius: 'var(--radius-DEFAULT)', border: '1px solid #dc2626', color: '#dc2626', background: 'transparent', cursor: 'pointer', fontSize: 'var(--body-sm)' }}
                  >
                    Annuler
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ padding: 'var(--spacing-6) 0', borderTop: '1px solid var(--surface-high)', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}>
        <p style={{ marginBottom: 'var(--spacing-4)' }}>© 2024 algbnb</p>
        <Link to="#" className="footer-link">Confidentialité</Link>
        <Link to="#" className="footer-link">Conditions</Link>
        <Link to="#" className="footer-link" style={{marginRight: 0}}>Assistance</Link>
      </footer>

      <BottomNavBar />
    </div>
  );
};
