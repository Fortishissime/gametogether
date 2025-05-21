import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import {
  Card,
  Typography,
  Box,
  CircularProgress,
  Stack,
  Button,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarRateIcon from '@mui/icons-material/StarRate';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import ChildCareIcon from '@mui/icons-material/ChildCare';

export default function DetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const location = useLocation();
  console.log(location)  

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`http://localhost:3000/api/games/${id}`);
        if (!res.ok) {
          throw new Error('Jeu non trouvé');
        }
        const data = await res.json();
        setGame(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [id]);

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!game) {
    return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1f2937',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
      }}
    />);
  }
  else {
    return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1f2937',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#374151',
          color: '#fff',
          borderRadius: 3,
          padding: 3,
          position: 'relative',
        }}
        elevation={8}
      >
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ flex: 1, paddingRight: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              {game.Title || game.Game_name || 'Titre indisponible'}
            </Typography>

            <Typography
              variant="body1"
              paragraph
              sx={{ whiteSpace: 'pre-line' }}
              className="text-justify"
            >
              {game.Description || game.description || 'Pas de description disponible.'}
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <ChildCareIcon />
                <Typography>
                  <strong>Âge recommandé :</strong> {game.Min_age || 'N/A'} ans
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <PeopleIcon />
                <Typography>
                  <strong>Joueurs :</strong> {game.Min_players} - {game.Max_players}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <AccessTimeIcon />
                <Typography>
                  <strong>Durée :</strong> {game.Playtime || 'N/A'} minutes
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <LeaderboardIcon />
                <Typography>
                  <strong>Rang :</strong> {game.IdRank || 'N/A'}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StarRateIcon />
                <Typography>
                  <strong>Note :</strong> {game.Average_Rate || 'N/A'} / 10
                </Typography>
              </Stack>
            </Box>
          </Box>

          {game.Cover && (
            <Box
              component="img"
              src={game.Cover}
              alt={`${game.Game_name || 'jeu'} cover`}
              sx={{
                width: 150,
                height: 'auto',
                borderRadius: 2,
                objectFit: 'cover',
                alignSelf: 'flex-start',
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 3,
          }}
        >
            <Button
            variant="contained"
            color="secondary"
            onClick={() => {
                navigate(location.state.from);
            }}
            >
            Retour
            </Button>
        </Box>
      </Card>
    </Box>
  );
}}
