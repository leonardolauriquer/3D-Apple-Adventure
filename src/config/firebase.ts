import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuração do Firebase para o seu aplicativo da web
const firebaseConfig = {
  apiKey: "AIzaSyDGqXRAwwjgbqf3vAw4XZjAUjo1NK1bKvY",
  authDomain: "d-apple-adventure.firebaseapp.com",
  projectId: "d-apple-adventure",
  storageBucket: "d-apple-adventure.firebasestorage.app",
  messagingSenderId: "367852596073",
  appId: "1:367852596073:web:de99a937e8529cebb86bf8",
  measurementId: "G-2XTFKKY7HN"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let firebaseEnabled = false;
const projectId = firebaseConfig.projectId;
const authDomain = firebaseConfig.authDomain;

// Verifica se as credenciais são válidas antes de inicializar
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseEnabled = true;
    console.log("Firebase inicializado com sucesso.");
  } catch (e) {
    console.error("Falha na inicialização do Firebase. Verifique sua configuração.", e);
    firebaseEnabled = false;
  }
} else {
    console.warn("As credenciais do Firebase estão ausentes. As funcionalidades online estarão desativadas.");
    firebaseEnabled = false;
}


export { app, auth, db, firebaseEnabled, projectId, authDomain };