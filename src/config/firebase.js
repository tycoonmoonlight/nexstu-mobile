import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD8RYimWLgbGRs41Iq7uzUN8dkPDF_Pn3Y",
  authDomain: "nexstu-22892.firebaseapp.com",
  projectId: "nexstu-22892",
  storageBucket: "nexstu-22892.firebasestorage.app",
  messagingSenderId: "760802461596",
  appId: "1:760802461596:web:237f9ee10aea03ed25aa59"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
