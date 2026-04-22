import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

async function runBookingE2E() {
  console.log("Starting Booking E2E Test...");
  
  try {
    // 1. Authenticate (User needs to be logged in for the rules to pass)
    // Replace with actual user credentials for test
    await signInWithEmailAndPassword(auth, "testuser@gmail.com", "password123");
    
    // 2. Simulate Adding to Cart Flow in Firestore
    // The cart logic seems to be handled locally in CartContext, but the final booking goes to /bookings
    console.log("Creating Booking...");
    
    const bookingData = {
      userId: auth.currentUser?.uid,
      userName: "Test User",
      userEmail: "testuser@gmail.com",
      status: 'pending',
      totalPrice: 2000,
      createdAt: serverTimestamp(), // Correct timestamp
      items: [{
        id: "tour-1",
        name: "Parvati Valley Tour",
        type: "tour",
        price: 2000,
        quantity: 1
      }]
    };
    
    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    console.log("Booking created with ID:", docRef.id);
    console.log("Booking E2E Test Completed Successfully!");
    
  } catch (error: any) {
    console.error("Booking E2E Test Failed:", error.message);
    if (error.code === 'permission-denied') {
        console.error("Check Firestore Security Rules: Permission Denied.");
    }
  }
}

runBookingE2E();
