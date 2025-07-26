// src/pages/HomePage.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { authState, logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Bem-vindo ao CoreBox!</h1>
      {authState.isAuthenticated ? (
        <div>
          <p>Olá, {authState.user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Descubra e gira as suas subscrições num só lugar.</p>
          <Link to="/login">Login</Link> | <Link to="/register">Registar</Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;