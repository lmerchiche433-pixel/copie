import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { BottomNavBar } from '../components/BottomNavBar';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001/api';

export const PageDashboardHote = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [annonces, setAnnonces] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/dashboard/hote/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erreur);
        setStats(data.stats);
        setAnnonces(data.logements);
        setReservations(data.reservations);
      } catch (err) {
        setErreur(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const toggleStatus = async (id, estActif) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/dashboard/logements/${id}/actif`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ est_actif: !estActif })
      });
      setAnnonces(annonces.map(a => a.id === id ? { ...a, est_actif: !estActif } : a));
    } catch (err) {
      alert('Erreur lors du changement de statut');
    }
  };

  const deleteAnnonce = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/annonces/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAnnonces(annonces.filter(a => a.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) return <div><Navbar /><div className="spinner"></div></div>;

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="page-container" style={{ flex: 1, marginTop: 'var(--spacing-16)' }}>

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-16)' }}>
          <div>
            <h4 style={{ fontSize: 'var(--title-lg)', color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-2)' }}>Algbnb Hôte</h4>
            <h1 style={{ fontSize: 'var(--display-md)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Tableau de bord</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <button className="btn-primary" onClick={() => navigate('/creer-annonce')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Nouvelle annonce
            </button>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ fontSize: 'var(--body-md)', fontWeight: 'bold' }}>{user?.nom} {user?.prenom}</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '13px' }}>Hôte</p>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--surface-high)', cursor: 'pointer' }} onClick={() => navigate('/profil')}></div>
          </div>
        </header>

        {erreur && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-DEFAULT)', marginBottom: 'var(--spacing-8)' }}>
            {erreur}
          </div>
        )}

        {/* Stats */}
        <section style={{ marginBottom: 'var(--spacing-16)' }}>
          <h2 style={{ fontSize: 'var(--headline-md)', marginBottom: 'var(--spacing-2)' }}>Bonjour, {user?.prenom}</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)', marginBottom: 'var(--spacing-8)' }}>
            Voici un aperçu de vos performances.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-6)' }}>
            <div className="card" style={{ padding: 'var(--spacing-8)' }}>
              <h3 style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)', fontWeight: 'normal', marginBottom: 'var(--spacing-2)' }}>Annonces actives</h3>
              <p style={{ fontSize: 'var(--headline-md)', fontWeight: 'bold' }}>{stats?.nb_logements_actifs || 0}</p>
            </div>
            <div className="card" style={{ padding: 'var(--spacing-8)' }}>
              <h3 style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)', fontWeight: 'normal', marginBottom: 'var(--spacing-2)' }}>Réservations totales</h3>
              <p style={{ fontSize: 'var(--headline-md)', fontWeight: 'bold' }}>{stats?.nb_reservations_total || 0}</p>
            </div>
            <div className="card" style={{ padding: 'var(--spacing-8)' }}>
              <h3 style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)', fontWeight: 'normal', marginBottom: 'var(--spacing-2)' }}>Revenus totaux</h3>
              <p style={{ fontSize: 'var(--headline-md)', fontWeight: 'bold' }}>{stats?.revenu_total || 0} DZD</p>
            </div>
            <div className="card" style={{ padding: 'var(--spacing-8)' }}>
              <h3 style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-md)', fontWeight: 'normal', marginBottom: 'var(--spacing-2)' }}>Note moyenne</h3>
              <p style={{ fontSize: 'var(--headline-md)', fontWeight: 'bold' }}>{parseFloat(stats?.note_moyenne || 0).toFixed(1)} ⭐</p>
            </div>
          </div>
        </section>

        {/* Mes Annonces */}
        <section style={{ marginBottom: 'var(--spacing-16)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
            <h3 style={{ fontSize: 'var(--title-lg)' }}>Mes annonces</h3>
          </div>
          {annonces.length === 0 ? (
            <p style={{ color: 'var(--on-surface-variant)' }}>Aucune annonce pour l'instant.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              {annonces.map(annonce => (
                <div key={annonce.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-6)', backgroundColor: 'var(--surface-lowest)', borderRadius: 'var(--radius-DEFAULT)', boxShadow: 'var(--shadow-ambient)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--surface-high)' }}>
                      {annonce.photos?.[0] && annonce.photos[0] !== 'null' && (
                        <img src={`http://localhost:3001${annonce.photos[0]}`} alt={annonce.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 'var(--body-md)', fontWeight: 'bold' }}>{annonce.titre}</h4>
                      <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}>{annonce.adresse} • {annonce.prix_par_nuit} DZD / nuit</p>
                      <span style={{ display: 'inline-block', marginTop: 'var(--spacing-2)', fontSize: '12px', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: annonce.est_actif ? 'var(--primary-container)' : 'var(--surface-high)', color: annonce.est_actif ? 'var(--on-primary-container)' : 'var(--on-surface-variant)' }}>
                        {annonce.est_actif ? 'En ligne' : 'En pause'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                    <button onClick={() => toggleStatus(annonce.id, annonce.est_actif)} title={annonce.est_actif ? 'Mettre en pause' : 'Activer'} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--outline-variant)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Power size={18} color={annonce.est_actif ? 'var(--warning)' : 'var(--primary)'} />
                    </button>
                    <button onClick={() => deleteAnnonce(annonce.id)} title="Supprimer" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--outline-variant)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Trash2 size={18} color="var(--error)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Réservations récentes */}
        <section style={{ marginBottom: 'var(--spacing-16)' }}>
          <h3 style={{ fontSize: 'var(--title-lg)', marginBottom: 'var(--spacing-6)' }}>Réservations récentes</h3>
          {reservations.length === 0 ? (
            <p style={{ color: 'var(--on-surface-variant)' }}>Aucune réservation pour l'instant.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              {reservations.map(r => (
                <div key={r.id} style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--surface-lowest)', borderRadius: 'var(--radius-DEFAULT)', boxShadow: 'var(--shadow-ambient)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: 'var(--body-md)', fontWeight: 'bold' }}>{r.voyageur_nom} {r.voyageur_prenom}</h4>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}>{r.nb_voyageurs} voyageur(s) • {r.logement_titre}</p>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}>{r.date_arrivee} → {r.date_depart}</p>
                  </div>
                  <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: r.statut === 'confirmee' ? 'var(--primary-container)' : r.statut === 'annulee' ? '#fee2e2' : 'var(--surface-high)', color: r.statut === 'confirmee' ? 'var(--on-primary-container)' : r.statut === 'annulee' ? '#dc2626' : 'var(--on-surface-variant)' }}>
                    {r.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
      <BottomNavBar />
    </div>
  );
};
