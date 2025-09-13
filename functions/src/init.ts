import { App, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

const app: App = initializeApp();

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
