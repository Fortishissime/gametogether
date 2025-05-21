import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import HomePage from './pages/HomePage';
import ConnexionPage from './pages/ConnexionPage';
import InscriptionPage from './pages/InscriptionPage';
import DetailsPage from './pages/DetailsPage';
import HistoryPage from './pages/HistoryPage';
import LogsPage from './pages/LogsPage';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connexion" element={<ConnexionPage/>}/>
        <Route path="/inscription" element={<InscriptionPage/>}/>
        <Route path="/games/:id" element={<DetailsPage />}/>
        <Route path='/history' element={<HistoryPage/>}></Route>
        <Route path='/logs' element={<LogsPage/>}></Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
