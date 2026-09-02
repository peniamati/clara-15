const fs = require('fs');
let content = fs.readFileSync('.github/workflows/deploy.yml', 'utf8');
content = content.replace(
  "env:\n          GITHUB_PAGES: 'true'",
  "env:\n          GITHUB_PAGES: 'true'\n          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}\n          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}\n          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}\n          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}\n          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}\n          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}"
);
fs.writeFileSync('.github/workflows/deploy.yml', content);
