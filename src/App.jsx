// App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({ courriel: '', mot_de_passe: '' });
  const [editingContact, setEditingContact] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    nom_complet: '',
    courriel: '',
    entreprise: '',
    service_interesse: '',
    message: ''
  });

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      fetchContacts();
    }
  }, []);

  // Fonction de connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://bacmekody.vercel.app/api/mekody/login', {
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
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer tous les contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('');
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('https://bacmekody.vercel.app/api/contact/contact_mekody', {
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
        fetchContacts(); // Rafraîchir la liste
      } else {
        setError('Erreur lors de l\'ajout du contact');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Modifier un contact
  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`https://bacmekody.vercel.app/api/contact/contact_mekody/${editingContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingContact),
      });
      
      if (response.ok) {
        setEditingContact(null);
        fetchContacts(); // Rafraîchir la liste
      } else {
        setError('Erreur lors de la modification du contact');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un contact
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`https://bacmekody.vercel.app/api/contact/contact_mekody/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchContacts(); // Rafraîchir la liste
      } else {
        setError('Erreur lors de la suppression du contact');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setContacts([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Connexion Administrateur</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={loginData.courriel}
                onChange={(e) => setLoginData({...loginData, courriel: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe:</label>
              <input
                type="password"
                value={loginData.mot_de_passe}
                onChange={(e) => setLoginData({...loginData, mot_de_passe: e.target.value})}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Administration des Contacts</h1>
        <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="content-container">
        <div className="actions-bar">
          <button 
            onClick={() => setShowAddForm(true)} 
            className="add-btn"
            disabled={loading}
          >
            Ajouter un contact
          </button>
          <button 
            onClick={fetchContacts} 
            className="refresh-btn"
            disabled={loading}
          >
            Actualiser
          </button>
        </div>

        {showAddForm && (
          <div className="modal">
            <div className="modal-content">
              <h2>Ajouter un contact</h2>
              <form onSubmit={handleAddContact}>
                <div className="form-group">
                  <label>Nom complet:</label>
                  <input
                    type="text"
                    value={newContact.nom_complet}
                    onChange={(e) => setNewContact({...newContact, nom_complet: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newContact.courriel}
                    onChange={(e) => setNewContact({...newContact, courriel: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Entreprise:</label>
                  <input
                    type="text"
                    value={newContact.entreprise}
                    onChange={(e) => setNewContact({...newContact, entreprise: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Service intéressé:</label>
                  <input
                    type="text"
                    value={newContact.service_interesse}
                    onChange={(e) => setNewContact({...newContact, service_interesse: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Message:</label>
                  <textarea
                    value={newContact.message}
                    onChange={(e) => setNewContact({...newContact, message: e.target.value})}
                    rows="4"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Ajout...' : 'Ajouter'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    disabled={loading}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingContact && (
          <div className="modal">
            <div className="modal-content">
              <h2>Modifier le contact</h2>
              <form onSubmit={handleUpdateContact}>
                <div className="form-group">
                  <label>Nom complet:</label>
                  <input
                    type="text"
                    value={editingContact.nom_complet}
                    onChange={(e) => setEditingContact({...editingContact, nom_complet: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editingContact.courriel}
                    onChange={(e) => setEditingContact({...editingContact, courriel: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Entreprise:</label>
                  <input
                    type="text"
                    value={editingContact.entreprise}
                    onChange={(e) => setEditingContact({...editingContact, entreprise: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Service intéressé:</label>
                  <input
                    type="text"
                    value={editingContact.service_interesse}
                    onChange={(e) => setEditingContact({...editingContact, service_interesse: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Message:</label>
                  <textarea
                    value={editingContact.message}
                    onChange={(e) => setEditingContact({...editingContact, message: e.target.value})}
                    rows="4"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingContact(null)}
                    disabled={loading}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && !showAddForm && !editingContact ? (
          <div className="loading">Chargement des contacts...</div>
        ) : (
          <div className="contacts-table-container">
            <h2>Liste des contacts ({contacts.length})</h2>
            {contacts.length === 0 ? (
              <p>Aucun contact à afficher.</p>
            ) : (
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Nom complet</th>
                    <th>Email</th>
                    <th>Entreprise</th>
                    <th>Service</th>
                    <th>Message</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(contact => (
                    <tr key={contact.id}>
                      <td>{contact.nom_complet}</td>
                      <td>{contact.courriel}</td>
                      <td>{contact.entreprise}</td>
                      <td>{contact.service_interesse}</td>
                      <td className="message-cell">{contact.message}</td>
                      <td className="actions-cell">
                        <button 
                          onClick={() => setEditingContact(contact)}
                          className="edit-btn"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="delete-btn"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;