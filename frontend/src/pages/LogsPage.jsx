import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
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

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/users/logs');
        if (!res.ok) throw new Error('Erreur lors du chargement des logs');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

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
    <Box className="min-h-screen bg-gray-900 text-white p-8 flex justify-center items-start">
      <Card className="w-full max-w-6xl bg-gray-800">
        <CardContent sx={{ backgroundColor: '#1e2939' }}>
          <Typography variant="h4" gutterBottom className="text-white text-center">
            Historique des logs
          </Typography>

          <TableContainer component={Paper} sx={{ backgroundColor: '#1f2937' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white' }}>Action</TableCell>
                  <TableCell sx={{ color: 'white' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.Log_id}>
                    <TableCell sx={{ color: 'white' }}>{log.Log_id}</TableCell>
                    <TableCell sx={{ color: 'white' }}>{log.Log_message}</TableCell>
                    <TableCell sx={{ color: 'white' }}>
                      {new Date(log.Created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
