import React, { useState, useEffect } from 'react';

import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Avatar,
  Menu,
  Stack,
  MenuItem,
  TextField,
  Alert,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRef } from 'react';

import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PersonIcon from '@mui/icons-material/Person';

import GroupIcon from '@mui/icons-material/Group';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ChildCareIcon from '@mui/icons-material/ChildCare';


export default function HomePage() {
  const [selectedTab, setSelectedTab] = useState('rejoindre');
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [playtime, setPlaytime] = useState('');
  const [age, setAge] = useState('');
  const [players, setPlayers] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [currentTime, setCurrentTime] = useState('');

  const [selectedGame, setSelectedGame] = useState(null);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);


  


  const recommendationsRef = useRef(null);
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (recommendations.length > 0 && recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [recommendations]);



  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const parisTime = new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Paris',
        hour12: false,
      }).format(now);
      setCurrentTime(parisTime);
    };

    updateClock(); // première mise à jour immédiate
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('user');
        console.log(e);
      }
    }

    async function fetchEvents() {
      try {
        const response = await fetch('http://localhost:3000/api/events/upcoming');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des événements');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error(error);
      }
    }




    fetchEvents();
  }, []);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    handleCloseMenu();
    window.location.reload();
  };

  const handleHistory = () => {
    handleCloseMenu();
    navigate('/history');
  };

  const handleSelectGame = (game) => {
    setSelectedGame(game);           // On garde en mémoire le jeu
    setRecommendations([]);         // On cache les recommandations
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll vers le haut
  };

  const resetCreation = () => {
    setSelectedGame(null);
    setTitle('');
    setDescription('');
    setDate('');
    setLocalisation('');
    setPlaytime('');
    setAge('');
    setPlayers('');
    setRecommendations([]);
};

const handleRegister = async (eventId) => {
  if (!user) {
    navigate('/connexion'); // Rediriger si l'utilisateur n'est pas connecté
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.userId }), // ou user.id selon ton modèle
    });

    console.log(user.userId)
    const data = await response.json();

    if (response.ok) {
      alert('Inscription réussie à l’événement !');
      window.location.reload();
    } else {
      alert(data.message || "Une erreur s'est produite lors de l'inscription.");
      window.location.reload();

    }
  } catch (err) {
    console.error('Erreur lors de l’inscription :', err);
    alert("Erreur réseau. Veuillez réessayer.");
  }
};


  const handleCreate = async () => {
    setError('');
    setSuccessMessage('');

    if (!selectedGame || !user || !title || !description || !date || !localisation) {
      setError("Veuillez remplir tous les champs avant de créer l'événement.");
      return;
    }

    try {
      console.log(user);

      const response = await fetch('http://localhost:3000/api/events/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: selectedGame.Game_id,
          creatorId: user.userId,
          title,
          description,
          date,
          localisation,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Événement créé avec succès !");
        setError('');
        setIsSubmitted(true);

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        setError(data.error || "Une erreur est survenue lors de la création.");
      }
    } catch (e) {
      console.error("Erreur réseau lors de la création :", e);
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
};



  const fetchRecommendations = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/games/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxPlaytime: parseInt(playtime),
          userAge: parseInt(age),
          availablePlayers: parseInt(players),
        }),
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (e) {
      console.error('Erreur recommandations :', e);
    }
  };

  const inputStyles = {
    variant: 'filled',
    fullWidth: true,
    autoComplete: 'off',
    InputLabelProps: { style: { color: '#ccc' } },
    InputProps: {
      disableUnderline: true,
      style: {
        backgroundColor: '#374151',
        color: '#fff',
        borderRadius: 6,
      },
    },
    sx: { mb: 2 },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="relative flex justify-end items-center mb-6">
        {/* Heure centrée */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-gray-400 font-medium text-4xl">
          {currentTime}
        </div>

        {/* Boutons ou avatar à droite */}
        <Box display="flex" gap={2} alignItems="center">
          {!user ? (
            <>
              <Button variant="outlined" color="primary" onClick={() => navigate('/connexion')}>
                Connexion
              </Button>
              <Button variant="contained" color="primary" onClick={() => navigate('/inscription')}>
                Inscription
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleAvatarClick}>
                <Avatar sx={{ bgcolor: '#3f51b5' }}>
                  {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                </Avatar>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    bgcolor: '#2c2f38',
                    color: 'white',
                    minWidth: 150,
                  },
                }}
              >
                <MenuItem disabled>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {user.username}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleHistory}>Historique</MenuItem>
                <MenuItem onClick={handleLogout}>Se déconnecter</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </div>
      <div className="flex justify-center space-x-8 mb-8">
        <Button
          variant={selectedTab === 'rejoindre' ? 'contained' : 'text'}
          color="primary"
          onClick={() => setSelectedTab('rejoindre')}
        >
          Rejoindre
        </Button>
        <Button
          variant={selectedTab === 'creer' ? 'contained' : 'text'}
          color="primary"
          onClick={() => setSelectedTab('creer')}
        >
          Créer
        </Button>
      </div>

      <div className="flex flex-col items-center">
        {selectedTab === 'rejoindre' ? (
          events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full px-4">
              {console.log(events)}
              {events.map((event) => (
                <Card
                  key={event.Event_id}
                  sx={{
                    backgroundColor: '#1f2937',
                    color: '#fff',
                    borderRadius: 3,
                    boxShadow: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 280,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {event.Title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                      {event.Event_description || 'Pas de description disponible.'}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <EventIcon fontSize="small" sx={{ color: 'gray.400' }} />
                      <Typography variant="body2">{new Date(event.Event_date).toLocaleString()}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <LocationOnIcon fontSize="small" sx={{ color: 'gray.400' }} />
                      <Typography variant="body2">{event.Event_location}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <SportsEsportsIcon fontSize="small" sx={{ color: 'gray.400' }} />
                      <Typography variant="body2">{event.Game_name}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <PersonIcon fontSize="small" sx={{ color: 'gray.400' }} />
                      <Typography variant="body2">Créé par : {event.Creator}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                      <GroupIcon fontSize="small" sx={{ color: 'gray.400' }} />
                      <Typography variant="body2">Participants : {event.ParticipantsCount + 1 || 1}</Typography>
                    </Stack>
                  </CardContent>

                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleRegister(event.Event_id)}
                    >
                      S'inscrire
                    </Button>
                  </Box>
                </Card>
              ))}
            </div>
          ) : (
    <Typography variant="h6">Aucun évènement n'est prévu prochainement.</Typography>
  )
        ) : !user ? (
          <Typography variant="h6">Vous devez vous connecter pour pouvoir créer un évènement.</Typography>
        ) : (
          <>
          <div className={`mt-6 w-full max-w-6xl mx-auto ${selectedGame ? 'flex flex-col lg:flex-row gap-8' : 'flex justify-center'}`}>
            <Card className="bg-[#1e1e2f] p-8 w-full max-w-4xl shadow-lg" sx={{ backgroundColor: '#1f2937', color: '#fff' }}>
              <CardContent>
                <Typography variant="h5" className='text-center' gutterBottom>Créer un évènement</Typography>

                <Box className="flex flex-col gap-1 mt-6">
                  {selectedGame && (
                  <>
                    <h1 className='mb-2 font-bold'>Informations de l'évènement</h1>

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

                    <TextField label="Titre" value={title} disabled={isSubmitted} onChange={(e) => setTitle(e.target.value)} {...inputStyles} />
                    <TextField label="Description" multiline rows={2} disabled={isSubmitted} value={description} onChange={(e) => setDescription(e.target.value)} {...inputStyles} />
                    <TextField label="Date et heure" type="datetime-local" disabled={isSubmitted}  value={date} onChange={(e) => setDate(e.target.value)} {...inputStyles} InputLabelProps={{ shrink: true, style: { color: '#ccc' } }}  />
                    <TextField label="Localisation" value={localisation} disabled={isSubmitted} onChange={(e) => setLocalisation(e.target.value)} {...inputStyles} />
                    <div className='flex align-middle  gap-3 justify-center'>
                      <Button variant="contained" disabled={isSubmitted} color="primary" onClick={handleCreate}>
                        Créer
                      </Button>
                      <Button variant="outlined" disabled={isSubmitted} color="primary" onClick={resetCreation}>
                        Annuler
                      </Button>
                    </div>
                  </>
                  )}
                  {!selectedGame && (
                  <>
                    <h1 className='mb-2 font-bold'>Paramètres de recherche</h1>
                    <TextField label="Temps de jeu (minutes)" type="number" value={playtime} onChange={(e) => setPlaytime(e.target.value)} {...inputStyles} />
                    <TextField label="Âge minimum" type="number" value={age} onChange={(e) => setAge(e.target.value)} {...inputStyles} />
                    <TextField label="Nombre de joueurs disponibles" type="number" value={players} onChange={(e) => setPlayers(e.target.value)} {...inputStyles} />
                    <Button variant="contained" color="primary" onClick={fetchRecommendations}>
                      Voir les recommandations
                    </Button>
                  </>
                  )}
                </Box>
              </CardContent>
            </Card>

              {/* Affichage du jeu sélectionné */}
            {selectedGame && (
              <Card
                className="w-full max-w-sm self-start" // nouvelle classe ajoutée
                sx={{
                  backgroundColor: '#1f2937',
                  color: '#fff',
                  borderRadius: 3,
                  boxShadow: 3,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {selectedGame.Game_name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedGame.Description.slice(0, 128)}
                    {selectedGame.Description.length > 128 ? '...' : ''}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <ScheduleIcon fontSize="small" sx={{ color: 'gray.400' }} />
                    <Typography variant="body2">Temps de jeu : {selectedGame.Playtime} min</Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <ChildCareIcon fontSize="small" sx={{ color: 'gray.400' }} />
                    <Typography variant="body2">Âge min : {selectedGame.Min_age} ans</Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <GroupIcon fontSize="small" sx={{ color: 'gray.400' }} />
                    <Typography variant="body2">
                      Joueurs : {selectedGame.Min_players} - {selectedGame.Max_players}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </div>
            {recommendations.length > 0 && (
              <div ref={recommendationsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-6xl w-full mx-auto">
                {recommendations.map((game) => (
                  <Card
                    key={game.Game_id}
                    sx={{
                      backgroundColor: '#1f2937',
                      color: '#fff',
                      borderRadius: 3,
                      boxShadow: 3,
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: 280,
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {game.Game_name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {game.Description.slice(0, 128)}
                        {game.Description.length > 128 ? '...' : ''}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <ScheduleIcon fontSize="small" sx={{ color: 'gray.400' }} />
                        <Typography variant="body2">Temps de jeu : {game.Playtime} min</Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <ChildCareIcon fontSize="small" sx={{ color: 'gray.400' }} />
                        <Typography variant="body2">Âge min : {game.Min_age} ans</Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <GroupIcon fontSize="small" sx={{ color: 'gray.400' }} />
                        <Typography variant="body2">
                          Joueurs : {game.Min_players} - {game.Max_players}
                        </Typography>
                      </Box>
                    </CardContent>

                    <Box mt={2} display="flex" justifyContent="space-between">
                      {console.log(game)}
                      <Button variant="outlined" color="primary" size="small" onClick={() => navigate(`/games/${game.Game_id}`, { state: { from: location } })}>
                        Détails
                      </Button>
                      <Button variant="contained" color="primary" size="small" onClick={() => handleSelectGame(game)}>
                        Créer
                      </Button>
                    </Box>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


