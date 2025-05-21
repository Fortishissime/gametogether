import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // si tu utilises react-router

export default function InscriptionPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate(); // hook pour la redirection

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMessage('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return re.test(password);
  };

  useEffect(() => {
    if (isSubmitted) {
      if (countdown === 0) {
        navigate('/'); // redirection vers la page d'accueil
      }
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown, isSubmitted, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;

    if (!validateEmail(email)) {
      setError("L'adresse e-mail n'est pas valide.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        'Le mot de passe doit contenir au moins 8 caractères, avec une majuscule, une minuscule, un chiffre et un caractère spécial.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        
        localStorage.setItem('user', JSON.stringify(data));

        setSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setError('');
        setIsSubmitted(true);  // on marque la soumission réussie
      } else {
        setError(data.error || "Une erreur est survenue lors de l'inscription.");
      }
    } catch (err) {
      setError('Impossible de contacter le serveur.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Paper
        elevation={6}
        className="p-8 w-full max-w-md bg-gray-800 text-white"
        sx={{ backgroundColor: '#1f2937', color: '#fff' }}
      >
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#fff' }}>
          Inscription
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col mt-4">
          <TextField
            label="Nom d'utilisateur"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            variant="filled"
            autoComplete="off"
            disabled={isSubmitted}
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{
              disableUnderline: true,
              style: { backgroundColor: '#374151', color: '#fff', borderRadius: 6 },
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="E-mail"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            variant="filled"
            autoComplete="off"
            disabled={isSubmitted}
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{
              disableUnderline: true,
              style: { backgroundColor: '#374151', color: '#fff', borderRadius: 6 },
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Mot de passe"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            variant="filled"
            autoComplete="off"
            disabled={isSubmitted}
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{
              disableUnderline: true,
              style: { backgroundColor: '#374151', color: '#fff', borderRadius: 6 },
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Confirmer le mot de passe"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
            variant="filled"
            autoComplete="off"
            disabled={isSubmitted}
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{
              disableUnderline: true,
              style: { backgroundColor: '#374151', color: '#fff', borderRadius: 6 },
            }}
            sx={{ mb: 6 }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitted}>
            S'inscrire
          </Button>
        </form>

        {isSubmitted && (
          <Typography variant="body2" align="center" sx={{ mt: 2, color: '#ccc' }}>
            Redirection dans {countdown}...
          </Typography>
        )}
      </Paper>
    </div>
  );
}
