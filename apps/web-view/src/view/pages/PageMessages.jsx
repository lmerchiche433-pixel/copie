import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { BottomNavBar } from '../components/BottomNavBar';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001/api';

export const PageMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');

  // Charger les conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${API_URL}/messages/conversations/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user]);

  // Charger les messages d'une conversation
  const handleSelectConv = async (conv) => {
    setSelectedConv(conv);
    try {
      const res = await fetch(`${API_URL}/messages/conversation/${conv.conversation_id}?id_lecteur=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
      // Marquer comme lu dans la liste
      setConversations(conversations.map(c =>
        c.conversation_id === conv.conversation_id ? { ...c, nb_non_lus: 0 } : c
      ));
    } catch (err) {
      console.error(err);
    }
  };

  // Envoyer un message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_conversation: selectedConv.conversation_id,
          id_expediteur: user.id,
          contenu: msgInput.trim()
        })
      });
      const newMsg = await res.json();
      setMessages([...messages, newMsg]);
      setMsgInput('');
      // Scroll vers le bas
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    }
  };

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="page-container" style={{ flex: 1, marginTop: 'var(--spacing-16)' }}>

        {!selectedConv ? (
          <>
            <header style={{ marginBottom: 'var(--spacing-12)' }}>
              <h1 style={{ fontSize: 'var(--display-md)', letterSpacing: '-0.02em', marginBottom: 'var(--spacing-4)', lineHeight: 1.1 }}>
                Messages
              </h1>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--headline-md)' }}>
                Vos conversations avec les hôtes et voyageurs.
              </p>
            </header>

            {loading ? (
              <div className="spinner"></div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-12)', color: 'var(--on-surface-variant)' }}>
                <p>Aucune conversation pour l'instant.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {conversations.map((conv) => (
                  <div
                    key={conv.conversation_id}
                    onClick={() => handleSelectConv(conv)}
                    style={{
                      display: 'flex',
                      gap: 'var(--spacing-4)',
                      padding: 'var(--spacing-4)',
                      borderBottom: '1px solid var(--surface-high)',
                      cursor: 'pointer',
                      alignItems: 'center',
                      backgroundColor: conv.nb_non_lus > 0 ? 'var(--surface-low)' : 'transparent',
                      borderRadius: 'var(--radius-DEFAULT)',
                      marginBottom: '2px'
                    }}
                  >
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      backgroundColor: 'var(--primary-container)', color: 'var(--on-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0
                    }}>
                      {conv.interlocuteur_nom?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <h4 style={{ fontSize: 'var(--body-md)', fontWeight: conv.nb_non_lus > 0 ? 'bold' : '600' }}>
                          {conv.interlocuteur_nom} {conv.interlocuteur_prenom}
                        </h4>
                        <span style={{ fontSize: 'var(--label-sm)', color: 'var(--on-surface-variant)', flexShrink: 0 }}>
                          {conv.dernier_message_date ? new Date(conv.dernier_message_date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p style={{ color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.dernier_message || 'Aucun message'}
                      </p>
                    </div>
                    {conv.nb_non_lus > 0 && (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>
                        {conv.nb_non_lus}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
            {/* Header conversation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', paddingBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--surface-high)', marginBottom: 'var(--spacing-4)' }}>
              <button
                onClick={() => setSelectedConv(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--on-surface-variant)' }}
              >
                <ArrowLeft size={24} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-container)', color: 'var(--on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {selectedConv.interlocuteur_nom?.charAt(0).toUpperCase()}
                </div>
                <h3 style={{ fontSize: 'var(--title-lg)', fontWeight: 'bold' }}>
                  {selectedConv.interlocuteur_nom} {selectedConv.interlocuteur_prenom}
                </h3>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', padding: 'var(--spacing-4) 0' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  alignSelf: msg.id_expediteur === user.id ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.id_expediteur === user.id ? 'var(--primary)' : 'var(--surface-low)',
                  color: msg.id_expediteur === user.id ? 'var(--on-primary)' : 'var(--on-surface)',
                  padding: 'var(--spacing-3) var(--spacing-4)',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '80%'
                }}>
                  <p style={{ fontSize: 'var(--body-md)', lineHeight: 1.4 }}>{msg.contenu}</p>
                  <span style={{ fontSize: '10px', display: 'block', textAlign: 'right', marginTop: '4px', opacity: 0.7 }}>
                    {new Date(msg.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}>
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder="Écrivez un message..."
                style={{ flex: 1, padding: 'var(--spacing-4)', borderRadius: 'var(--radius-full)', border: '1px solid var(--outline-variant)', fontSize: 'var(--body-md)' }}
              />
              <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={20} />
              </button>
            </form>
          </div>
        )}
      </div>

      {!selectedConv && (
        <footer style={{ padding: 'var(--spacing-6) 0', borderTop: '1px solid var(--surface-high)', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 'var(--body-sm)' }}>
          <Link to="#" className="footer-link">Confidentialité</Link>
          <Link to="#" className="footer-link">Conditions</Link>
          <Link to="#" className="footer-link" style={{marginRight: 0}}>Aide</Link>
        </footer>
      )}
      <BottomNavBar />
    </div>
  );
};
