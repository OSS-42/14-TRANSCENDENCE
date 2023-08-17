import { useState, useEffect } from 'react'
import axios from 'axios'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [jwtToken, setJwtToken] = useState('');

  useEffect(() => {
    // Fonction pour récupérer un cookie par son nom
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Récupérez le cookie sécurisé contenant le JWT
    const token = getCookie('jwt_token');
    setJwtToken(token || 'No JWT token found.');

    // Exemple d'utilisation du cookie dans une requête HTTP
    axios.get('http://localhost:3001/api/endpoint', {
      headers: {
        Authorization: `Bearer ${token}` // Utilisation du cookie sécurisé
      }
    })
    .then(response => {
      console.log('API Response:', response.data);
    })
    .catch(error => {
      console.error('API Error:', error);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>JWT Token: {jwtToken}</p>
      </header>
    </div>
  );
}

export default App;
