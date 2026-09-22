import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';

let pending: Promise<string> | null = null;

function getLocalVisitorId(): string {
  try {
    let localId = localStorage.getItem('clara15_visitor_id');
    if (!localId) {
      localId = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem('clara15_visitor_id', localId);
    }
    return localId;
  } catch {
    return 'v_' + Math.random().toString(36).substring(2, 11);
  }
}

export async function visitorId(): Promise<string> {
  try {
    await auth.authStateReady();
    if (auth.currentUser) return auth.currentUser.uid;
    if (!pending) {
      pending = signInAnonymously(auth)
        .then(r => r.user.uid)
        .catch(err => {
          console.warn('Anonymous auth unavailable, using persistent visitor ID:', err);
          return getLocalVisitorId();
        })
        .finally(() => { pending = null; });
    }
    return await pending;
  } catch (err) {
    console.warn('visitorId fallback to local id:', err);
    return getLocalVisitorId();
  }
}

