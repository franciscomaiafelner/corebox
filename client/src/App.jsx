import React, { Fragment, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import './App.css';

function App() {
  const { authState, logout } = useContext(AuthContext);
  const { isAuthenticated, isLoading, user } = authState;

  if (isLoading) {
    return <h1>A carregar...</h1>;
  }

  // Links para utilizadores autenticados
  const authLinks = (
    <Fragment>
      <h2>Olá, {user && user.name}!</h2>
      <button onClick={logout}>Logout</button>
    </Fragment>
  );

  // Links para convidados (não autenticados)
  const guestLinks = (
    <Fragment>
      <h2>Registo</h2>
      <Register />
      <hr />
      <h2>Login</h2>
      <Login />
    </Fragment>
  );

  return (
    <div>
      <h1>Bem-vindo ao CoreBox</h1>
      {isAuthenticated ? authLinks : guestLinks}
    </div>
  );
}

export default App;