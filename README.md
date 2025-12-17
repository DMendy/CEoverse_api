# CEOverse API

API Express (Node 18+) pour recevoir les messages du formulaire de contact Ceoverse. Le projet est prêt à être déployé sur Render, Vercel ou tout autre provider Node et fournit une base claire pour ajouter d'autres endpoints.

## Prérequis
- Node.js 18 ou plus récent
- npm 9+

## Installation & scripts
```bash
npm install               # installe les dépendances
npm run dev               # démarre avec nodemon (reload auto)
npm start                 # démarre en production
npm run lint              # vérifie le style avec ESLint
```

## Variables d'environnement
Copiez `.env.example` vers `.env` et complétez selon votre provider SMTP / front.

| Variable | Description |
| --- | --- |
| `PORT` | Port HTTP local (par défaut `4000`). |
| `FRONT_ORIGIN` | Origine(s) autorisées pour CORS, séparées par des virgules (ex: `https://ceoverse.com,https://app.ceoverse.com`). |
| `CONTACT_INBOX` | Email de destination qui recevra les messages. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_SECURE` | Config Nodemailer. Si absent, un transport JSON stub loggue simplement le contenu. |
| `RATE_LIMIT_WINDOW` | Fenêtre de rate limiting en ms (défaut `60000`). |
| `RATE_LIMIT_MAX` | Nombre max de requêtes / fenêtre (défaut `10`). |
| `MESSAGE_STORE_PATH` | (Optionnel) Chemin absolu pour stocker `messages.json`. Si non défini, `data/messages.json` est utilisé en local et `/tmp/ceoverse-messages.json` sur Vercel. |

## Architecture
```
src/
  app.js                # configuration Express + middlewares
  index.js              # bootstrap serveur
  config/env.js         # lecture des variables d'env
  controllers/          # contact.controller.js
  services/             # validation + persistance + mail
  middlewares/          # rate limit, 404, erreurs
  routes/               # endpoint /api/contact
  utils/                # HttpError, logger, asyncHandler
```
Les messages sont persistés dans `data/messages.json` via un service dédié pour faciliter le passage ultérieur à une base réelle.

## Endpoint principal
`POST /api/contact`
```json
{
  "name": "Ava",
  "email": "ava@example.com",
  "message": "Bonjour !"
}
```
- Validation champ par champ (non vide, email valide, taille max).
- Logs HTTP (morgan) + logs applicatifs JSON.
- Sauvegarde dans `data/messages.json` + envoi d'un mail (réel si SMTP configuré, sinon stub).
- Réponses :
  - `200 { "ok": true }` si tout va bien.
  - `400` avec `details` en cas de payload invalide.
  - `429` si la limite (10 req/min/IP par défaut) est dépassée.
  - `500` pour toute erreur serveur.

## Test rapide (curl)
```bash
curl -X POST http://localhost:4000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ava Exemple",
    "email": "ava@example.com",
    "message": "Bonjour CEOverse !"
  }'
```

## Thunder Client / Postman
Une collection Postman prête à l'emploi est disponible : `CEOverse-contact.postman_collection.json`.
Importez-la puis ajustez la variable `baseUrl`.

## Brancher le front React
Depuis votre front (ou `fetch` côté client) :
```js
async function sendContact(payload) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur réseau');
  }

  return response.json();
}
```
Gérez les messages d'erreur retournés (`error` et éventuellement `details`) pour afficher des feedbacks utilisateur.

## Déploiement
### Render (Web Service)
1. Créez un service "Web Service" pointant sur ce repo.
2. Runtime: Node 18, Build Command `npm install`, Start Command `npm start`.
3. Ajoutez les variables d'environnement (voir tableau plus haut).

### Vercel
1. Importez le repo dans Vercel.
2. Dans "Settings > Environment Variables", configurez les mêmes clés.
3. Définissez `Build Command` sur `npm install` et `Output Directory` laissé vide (API Node). Vercel lancera `npm start`.

Dans tous les cas, exposez `/api/contact` derrière HTTPS et configurez `FRONT_ORIGIN` avec l'URL de votre front pour que CORS laisse passer les requêtes.
