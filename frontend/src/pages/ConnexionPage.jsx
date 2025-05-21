import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ConnexionPage() {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMessage('');
  };

  useEffect(() => {
    let timer;
    if (successMessage) {
      if (countdown === 0) {
        navigate('/');
      } else {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [countdown, successMessage, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        setSuccessMessage('Connexion réussie ! Redirection dans 3 secondes...');
      } else {
        setError(data.error || 'Erreur lors de la connexion.');
      }
    } catch (err) {
      setError('Impossible de contacter le serveur.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
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
          Connexion
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage} (Redirection dans {countdown}...)
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col mt-4">
          <TextField
            label="Nom d'utilisateur ou E-mail"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            fullWidth
            variant="filled"
            autoComplete="off"
            disabled={isSubmitting || successMessage !== ''}
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{
              disableUnderline: true,
              style: {
                backgroundColor: '#374151',
                color: '#fff',
                borderRadius: 6,
              },
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
            disabled={isSubmitting || successMessage !== ''}
            InputLabelProps={{ style: { color: '#ccc' } }}
            InputProps={{
              disableUnderline: true,
              style: {
                backgroundColor: '#374151',
                color: '#fff',
                borderRadius: 6,
              },
            }}
            sx={{ mb: 6 }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting || successMessage !== ''}>
            Se connecter
          </Button>
        </form>
      </Paper>
    </div>
  );
}
