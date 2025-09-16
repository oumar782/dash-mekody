// App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

// Composant Toast pour les notifications
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ'}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ courriel: '', mot_de_passe: '' });
  const [editingContact, setEditingContact] = useState(null);
  const [viewingContact, setViewingContact] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    nom_complet: '',
    courriel: '',
    entreprise: '',
    service_interesse: '',
    message: ''
  });
  const [toasts, setToasts] = useState([]);

  // Ajouter un toast
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Supprimer un toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      fetchContacts();
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Fonction de connexion — URL CORRIGÉE ✅
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://bacmekody.vercel.app/api/mekody/login', { // ✅ ESPACES SUPPRIMÉS
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', 'authenticated');
        setIsAuthenticated(true);
        fetchContacts();
        addToast('Connexion réussie!', 'success');
      } else {
        addToast(data.message || 'Erreur de connexion', 'error');
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      addToast('Erreur de connexion au serveur', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer tous les contacts — URL CORRIGÉE ✅
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://bacmekody.vercel.app/api/contact/contact_mekody'); // ✅ ESPACES SUPPRIMÉS
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setContacts(data);
      addToast(`${data.length} contacts chargés avec succès`, 'success');
    } catch (err) {
      console.error("Erreur fetchContacts :", err);
      addToast('Erreur lors du chargement des contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un contact — URL CORRIGÉE ✅
  const handleAddContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://bacmekody.vercel.app/api/contact/contact_mekody', { // ✅
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContact),
      });
      
      if (response.ok) {
        setNewContact({
          nom_complet: '',
          courriel: '',
          entreprise: '',
          service_interesse: '',
          message: ''
        });
        setShowAddForm(false);
        fetchContacts();
        addToast('Contact ajouté avec succès', 'success');
      } else {
        addToast('Erreur lors de l\'ajout du contact', 'error');
      }
    } catch (err) {
      console.error("Erreur handleAddContact :", err);
      addToast('Erreur de connexion au serveur', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Modifier un contact — URL CORRIGÉE ✅
  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`https://bacmekody.vercel.app/api/contact/contact_mekody/${editingContact.id}`, { // ✅ ESPACES SUPPRIMÉS
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingContact),
      });
      
      if (response.ok) {
        setEditingContact(null);
        fetchContacts();
        addToast('Contact modifié avec succès', 'success');
      } else {
        addToast('Erreur lors de la modification du contact', 'error');
      }
    } catch (err) {
      console.error("Erreur handleUpdateContact :", err);
      addToast('Erreur de connexion au serveur', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un contact — URL CORRIGÉE ✅
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`https://bacmekody.vercel.app/api/contact/contact_mekody/${id}`, { // ✅
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchContacts();
        addToast('Contact supprimé avec succès', 'success');
      } else {
        addToast('Erreur lors de la suppression du contact', 'error');
      }
    } catch (err) {
      console.error("Erreur handleDeleteContact :", err);
      addToast('Erreur de connexion au serveur', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setContacts([]);
    addToast('Déconnexion réussie', 'success');
  };

  // ⚠️ IMPORTANT : Si l'utilisateur n'est PAS authentifié, ON AFFICHE UNIQUEMENT LE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon"></span>
              <h1>Mekody Admin</h1>
            </div>
            <p>Interface d'administration des contacts</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={loginData.courriel}
                onChange={(e) => setLoginData({...loginData, courriel: e.target.value})}
                required
                placeholder="votre@email.com"
              />
              <span className="input-icon"></span>
            </div>
            
            <div className="input-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={loginData.mot_de_passe}
                onChange={(e) => setLoginData({...loginData, mot_de_passe: e.target.value})}
                required
                placeholder="Votre mot de passe"
              />
              <span className="input-icon"></span>
            </div>
            
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p>© 2025 Mekody - Tous droits réservés</p>
          </div>
        </div>
        
        {/* Toast Container */}
        <div className="toast-container">
          {toasts.map(toast => (
            <Toast 
              key={toast.id} 
              message={toast.message} 
              type={toast.type} 
              onClose={() => removeToast(toast.id)} 
            />
          ))}
        </div>
      </div>
    );
  }

  // ✅ Si authentifié, afficher l'interface admin
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon"></span>
            <h1>Mekody</h1>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon"></span>
            <span className="nav-text">Les demandes</span>
          </div>
       
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="btn-icon"></span>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="content-header">
          <h2>Gestion des demandes</h2>
          <div className="header-actions">
            <button 
              onClick={() => setShowAddForm(true)} 
              className="btn-primary"
              disabled={loading}
            >
              <span className="btn-icon">+</span>
              Nouveau Contact
            </button>
            <button 
              onClick={fetchContacts} 
              className="btn-secondary"
              disabled={loading}
            >
              <span className="btn-icon"></span>
              Actualiser
            </button>
          </div>
        </header>

        <div className="content-body">
          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon total">
                <span className="total-icon">📊</span>
              </div>
              <div className="stat-info">
                <h3>{contacts.length}</h3>
                <p>demande total</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon recent">🆕</div>
              <div className="stat-info">
                <h3>{contacts.filter(c => {
                  const contactDate = new Date(c.date_creation || Date.now());
                  const today = new Date();
                  return contactDate.toDateString() === today.toDateString();
                }).length}</h3>
                <p>Aujourd'hui</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon companies"></div>
              <div className="stat-info">
                <h3>{new Set(contacts.map(c => c.entreprise)).size}</h3>
                <p>Entreprises</p>
              </div>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="card">
            <div className="card-header">
              <h3>Liste des demandes</h3>
              <div className="search-box">
                <input type="text" placeholder="Rechercher..." />
                <span className="search-icon">🔍</span>
              </div>
            </div>
            
            <div className="card-body">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Chargement des contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h4>Aucun contact trouvé</h4>
                  <p>Commencez par ajouter votre premier contact</p>
                  <button 
                    onClick={() => setShowAddForm(true)} 
                    className="btn-primary"
                  >
                    Ajouter un contact
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nom complet</th>
                        <th>Email</th>
                        <th>Entreprise</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map(contact => (
                        <tr key={contact.id}>
                          <td>
                            <div className="contact-info">
                              <div className="avatar">
                                {contact.nom_complet.charAt(0).toUpperCase()}
                              </div>
                              <div className="contact-details">
                                <div className="contact-name">{contact.nom_complet}</div>
                                <div className="contact-message">{contact.message && contact.message.substring(0, 30)}...</div>
                              </div>
                            </div>
                          </td>
                          <td>{contact.courriel}</td>
                          <td>{contact.entreprise || '-'}</td>
                          <td>
                            <span className="service-tag">{contact.service_interesse || 'Non spécifié'}</span>
                          </td>
                          <td>
                            {contact.date_creation ? new Date(contact.date_creation).toLocaleDateString() : '-'}
                          </td>
                          <td>
                            <div className="table-actions">
                              <button 
                                onClick={() => setViewingContact(contact)}
                                className="action-btn view"
                                title="Voir"
                              >
                                👁️
                              </button>
                              <button 
                                onClick={() => setEditingContact(contact)}
                                className="action-btn edit"
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDeleteContact(contact.id)}
                                className="action-btn delete"
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Ajouter un contact</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddContact} className="modal-body">
              <div className="form-row">
                <div className="input-group">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    value={newContact.nom_complet}
                    onChange={(e) => setNewContact({...newContact, nom_complet: e.target.value})}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newContact.courriel}
                    onChange={(e) => setNewContact({...newContact, courriel: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label>Entreprise</label>
                  <input
                    type="text"
                    value={newContact.entreprise}
                    onChange={(e) => setNewContact({...newContact, entreprise: e.target.value})}
                  />
                </div>
                
                <div className="input-group">
                  <label>Service intéressé</label>
                  <select
                    value={newContact.service_interesse}
                    onChange={(e) => setNewContact({...newContact, service_interesse: e.target.value})}
                  >
                    <option value="">Sélectionner un service</option>
                    <option value="Marketing Digital">Marketing Digital</option>
                    <option value="Evacuation sanitaire">Evacuation sanitaire</option>
                    <option value="voyage organisé">voyage organisé</option>
                    <option value="Solutions digitales">Solutions digitales</option>
                    <option value="Autre">Autre</option>
                    <option value="Formation">Formation</option>
                  </select>
                </div>
              </div>
              
              <div className="input-group">
                <label>Message</label>
                <textarea
                  value={newContact.message}
                  onChange={(e) => setNewContact({...newContact, message: e.target.value})}
                  rows="4"
                  placeholder="Message du contact..."
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Ajout en cours...' : 'Ajouter le contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {viewingContact && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Détails du contact</h3>
              <button 
                onClick={() => setViewingContact(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="contact-detail-header">
                <div className="detail-avatar">
                  {viewingContact.nom_complet.charAt(0).toUpperCase()}
                </div>
                <div className="detail-title">
                  <h4>{viewingContact.nom_complet}</h4>
                  <p>{viewingContact.courriel}</p>
                </div>
              </div>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Entreprise</span>
                  <span className="detail-value">{viewingContact.entreprise || 'Non spécifié'}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Service intéressé</span>
                  <span className="detail-value">{viewingContact.service_interesse || 'Non spécifié'}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Date de création</span>
                  <span className="detail-value">
                    {viewingContact.date_creation 
                      ? new Date(viewingContact.date_creation).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Non spécifié'}
                  </span>
                </div>
                
                <div className="detail-item full-width">
                  <span className="detail-label">Message</span>
                  <div className="detail-message">
                    {viewingContact.message || 'Aucun message'}
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={() => setViewingContact(null)}
                  className="btn-primary"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Modifier le contact</h3>
              <button 
                onClick={() => setEditingContact(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateContact} className="modal-body">
              <div className="form-row">
                <div className="input-group">
                  <label>Nom complet *</label>
                  <input
                    type="text"
                    value={editingContact.nom_complet}
                    onChange={(e) => setEditingContact({...editingContact, nom_complet: e.target.value})}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={editingContact.courriel}
                    onChange={(e) => setEditingContact({...editingContact, courriel: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label>Entreprise</label>
                  <input
                    type="text"
                    value={editingContact.entreprise}
                    onChange={(e) => setEditingContact({...editingContact, entreprise: e.target.value})}
                  />
                </div>
                
                <div className="input-group">
                  <label>Service intéressé</label>
                  <select
                    value={editingContact.service_interesse}
                    onChange={(e) => setEditingContact({...editingContact, service_interesse: e.target.value})}
                  >
                    <option value="">Sélectionner un service</option>
                    <option value="Développement Web">Développement Web</option>
                    <option value="Design Graphique">Design Graphique</option>
                    <option value="Marketing Digital">Marketing Digital</option>
                    <option value="Consultance">Consultance</option>
                    <option value="Formation">Formation</option>
                  </select>
                </div>
              </div>
              
              <div className="input-group">
                <label>Message</label>
                <textarea
                  value={editingContact.message}
                  onChange={(e) => setEditingContact({...editingContact, message: e.target.value})}
                  rows="4"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setEditingContact(null)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </div>
  );
}

export default App;