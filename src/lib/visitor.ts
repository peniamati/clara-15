import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';

let pending: Promise<string> | null = null;
export async function visitorId(): Promise<string> {
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser.uid;
  if (!pending) pending = signInAnonymously(auth).then(r => r.user.uid).finally(() => { pending = null; });
  return pending;
}
