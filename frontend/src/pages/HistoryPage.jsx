import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  CircularProgress
} from '@mui/material';

export default function HistoryPage() {

  const [user] = useState(JSON.parse(localStorage.getItem('user')))
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/users/${user.userId}/history`);
        if (!res.ok) throw new Error("Erreur lors du chargement de l'historique");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.userId]);

  if (loading) {
    return (
      <Box className="min-h-screen flex justify-center items-center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="min-h-screen flex justify-center items-center">
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-900 text-white p-8">
      <Typography variant="h4" gutterBottom className="text-center text-white mb-6">
        Historique des participations
      </Typography>

      <TableContainer component={Paper} sx={{ backgroundColor: '#1f2937' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Participant</TableCell>
              <TableCell sx={{ color: 'white' }}>Titre</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Lieu</TableCell>
              <TableCell sx={{ color: 'white' }}>Rôle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((event) => (
              <TableRow key={event.Event_id}>
                <TableCell sx={{ color: 'white' }}>{event.Username}</TableCell>
                <TableCell sx={{ color: 'white' }}>{event.Title}</TableCell>
                <TableCell sx={{ color: 'white' }}>{new Date(event.Event_date).toLocaleDateString()}</TableCell>
                <TableCell sx={{ color: 'white' }}>{event.Event_location}</TableCell>
                <TableCell sx={{ color: 'white' }}>{event.Role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
