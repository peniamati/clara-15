const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const { initializeApp, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { MIN_REFRESH_MS, LEASE_MS, fetchSpotifyPlaylist } = require('./spotify');

initializeApp();
const clientId = defineSecret('SPOTIFY_CLIENT_ID');
const refreshToken = defineSecret('SPOTIFY_REFRESH_TOKEN');
const databaseId = defineString('SPOTIFY_FIRESTORE_DATABASE_ID', { default: '(default)' });

exports.refreshSpotifyOnVisit = onCall({
  region: 'us-central1',
  secrets: [clientId, refreshToken],
  timeoutSeconds: 90,
  maxInstances: 2
}, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Se requiere una sesión de visitante.');
  const db = getFirestore(getApp(), databaseId.value());
  const snapshot = db.doc('spotifySync/current');
  const now = Date.now();
  const claimed = await db.runTransaction(async transaction => {
    const current = await transaction.get(snapshot);
    const data = current.data() || {};
    if ((data.updatedAt || 0) > now - MIN_REFRESH_MS || (data.leaseUntil || 0) > now) return false;
    transaction.set(snapshot, { leaseUntil: now + LEASE_MS }, { merge: true });
    return true;
  });
  if (!claimed) return { refreshed: false };

  try {
    const tracks = await fetchSpotifyPlaylist({ clientId: clientId.value(), refreshToken: refreshToken.value() });
    await snapshot.set({ tracks, updatedAt: Date.now(), leaseUntil: 0 }, { merge: true });
    return { refreshed: true };
  } catch (error) {
    console.error('Spotify live refresh failed:', error);
    // Keep the previously shared playlist. Permit a retry after the short lease.
    await snapshot.update({ leaseUntil: 0 }).catch(() => {});
    throw new HttpsError('unavailable', 'No se pudo actualizar Spotify en este momento.');
  }
});
