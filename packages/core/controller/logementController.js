const API_URL = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

export const getLogements = async () => {
  const res = await fetch(`${API_URL}/logements`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.erreur);
  return data;
};

export const getLogementById = async (id) => {
  const res = await fetch(`${API_URL}/logements/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.erreur);
  return data;
};

export const rechercherLogements = async (query) => {
  const res = await fetch(`${API_URL}/logements`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.erreur);
  if (!query) return data;
  const q = query.toLowerCase();
  return data.filter(l =>
    l.adresse?.toLowerCase().includes(q) ||
    l.titre?.toLowerCase().includes(q) ||
    l.type_logement?.toLowerCase().includes(q)
  );
};

export const creerLogement = async (formData) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/annonces`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData // FormData pour les photos
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erreur);
  return data;
};

export const supprimerLogement = async (id) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/logements/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erreur);
  return true;
};
