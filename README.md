# 🎲 GameTogether

## Attention : Il s'agit d'un ré-upload à partir de la pré-version du site. Le dépôt git original et son historique demeurent privés (dû à des mots de passe en clairs dans le code notamment)

**GameTogether** est une application web dédiée à la gestion d'événements de jeux de société. Elle permet à des utilisateurs de consulter des événements à venir, de rejoindre des sessions ou d'en créer, tout en s'appuyant sur une base de données riche alimentée depuis un jeu de données issu de Kaggle.

---

## 🚀 Objectif du projet

Ce projet a été réalisé dans le cadre du cours **TI603 - Bases de données avancées**.  
L'objectif était de :

- Concevoir une **base de données relationnelle** autour des jeux de société.
- Développer une **application web** connectée à cette base.
- Implémenter des **fonctionnalités SQL avancées** : vues, triggers, procédures stockées, index...

---

## 📦 Technologies utilisées

- **Frontend** : React + Vite + TailwindCSS + MUI
- **Backend** : Node.js + Express + MySQL (mysql2/promise)
- **Base de données** : MySQL avec scripts initDB, triggers, procédures et vues

---

## 🧪 Installation et lancement

### Prérequis

- Node.js (v18 ou plus)
- MySQL Server

### Étapes

1. **Cloner le projet**

```bash
git clone https://github.com/votre-repo/gametogether.git
cd gametogether
```

2. **Configurer la base de données**

Créer un fichier `.env` dans le dossier `/backend` :

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gametogether
```

⚠️ La base de données sera automatiquement créée par le script `initDB`.

3. **Démarrer le frontend**

```bash
cd frontend
npm install
npm run dev
```

4. **Démarrer le backend**

```bash
cd ../backend
npm install
node ./server.js
```

5. **Accéder à l'application**

Rendez-vous sur [http://localhost:5173](http://localhost:5173)

---

## 🧭 Fonctionnalités

- 🔍 Affichage des événements à venir
- ➕ Création d’un événement (si connecté)
- 🧑‍🤝‍🧑 Rejoindre un événement
- 📊 Recommandations de jeux (backend uniquement)
- 🛡️ Triggers SQL (contrôle des dates et participations)
- ⚙️ Historique utilisateur et statistiques via vues SQL

---

## 🐞 Bugs connus / Limites

- ❌ Pas de système d’authentification complet (simulation seulement)
- 🛑 Pas de filtre/recherche de jeux côté frontend
- 📱 Responsive mais pas totalement optimisé mobile
- 🎮 Système de recommandation non exposé en frontend
- 🌐 Déploiement distant non prévu

---

## 📁 Structure du projet

```
gametogether/
├── backend/
│   ├── server.js
│   ├── initDB.js
│   ├── .env (à créer)
│   └── ...
├── frontend/
│   ├── src/
│   ├── index.html
│   └── ...
```

---

## 👥 Équipe

Projet réalisé par :  
- AMI SAADA Massil Achour  
- TCHING Angela  
- JIN John  
- MARLIN Maceo

---

## 📘 Licence

Ce projet est à usage pédagogique dans le cadre du module Base de données Avancées d'EFREI Paris
