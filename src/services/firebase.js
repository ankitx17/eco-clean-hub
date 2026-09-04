import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyCF_OilbgheL-FTa-aphqiLQcSi0NNuzxk",
  authDomain: "eco-clean-hub.firebaseapp.com",
  projectId: "eco-clean-hub",
  storageBucket: "eco-clean-hub.firebasestorage.app",
  messagingSenderId: "446763078666",
  appId: "1:446763078666:web:f697d6d2a13bcdacfa7bf3",
  measurementId: "G-5VQ67PB004",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app