import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, getDoc, doc, setDoc, collection } from 'firebase/firestore';
import { getAuth, fetchSignInMethodsForEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBp6OPBnhqaBCNYGfFBTeYZJbVkWwxAstU",
    authDomain: "database225-39f87.firebaseapp.com",
    projectId: "database225-39f87",
    storageBucket: "database225-39f87.firebasestorage.app",
    messagingSenderId: "781918962679",
    appId: "1:781918962679:web:d43d2b6b77f71f998b64f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const scoreboardRef = collection(db, 'scoreboard');
const DOMAIN_SUFFIX = "@hypersweeper.com";
const auth = getAuth(app);
let userUID = '';


// All vibe-coded with Gemini

export const load = async () => {
    // Get a specific document reference using the UID as the Document ID
    const userDocRef = doc(db, 'scoreboard', userUID);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
    // If the document exists, return its data
    return userDoc.data();
    } else {
    // Document does not exist
    return null;
    }
};

export const save = async (scores) => {
  // 1. Get the reference to the specific document using the UID as the Document ID.
  const userDocRef = doc(db, 'scoreboard', userUID);

  try {
    // 2. setDoc creates/overwrites the document using the UID.
    await setDoc(userDocRef, {
      scores,
      // You can store the display username *if you have it* but the document ID MUST be the UID.
      userUID 
    });
    console.log(`Scores for user ${userUID} saved/updated successfully.`);
  } catch (e) {
    console.error("Error saving document: ", e);
  }
};

export const logOut = () => {
    signOut(auth).then(() => {
        // Sign-out successful. User is now logged out.
        console.log("User successfully logged out.");
    }).catch((error) => {
        // An error happened.
        console.error("Logout error:", error);
    });
};

/**
 * Creates a new Firebase user account using a username and password.
 * Internally converts the username into a dummy email.
 * @param {string} username - The user's chosen identifier (e.g., "GamerTag123").
 * @param {string} password - The user's chosen password.
 */
export const createAccountWithUsername = async (username, password) => {
    // 1. Construct the dummy email
    const dummyEmail = username + DOMAIN_SUFFIX;

    try {
        // 2. Call the standard Firebase function with the dummy email
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            dummyEmail,
            password
        );
        
        const user = userCredential.user;
        
        userUID = user.uid;
        alert(`User ${user.uid} created successfully with username: ${username}`);
        return true
    } catch (error) {
        // Handle specific errors like 'auth/email-already-in-use'
        // which now means 'username already in use'
        alert("Account creation failed:" + error.message);
        return false;
    }
};

/**
 * Logs in a Firebase user using a username and password.
 * @param {string} username - The user's identifier.
 * @param {string} password - The user's password.
 */
export const loginWithUsername = async (username, password) => {
    // 1. Construct the dummy email
    const dummyEmail = username + DOMAIN_SUFFIX;

    try {
        // 2. Call the standard Firebase sign-in function
        const userCredential = await signInWithEmailAndPassword(
            auth,
            dummyEmail,
            password
        );
        
        const user = userCredential.user;
        alert(`User ${user.uid} logged in successfully.`);
        userUID = user.uid;
        return true;
    } catch (error) {
        // Handle errors like 'auth/invalid-credential' 
        alert("Login failed:" + error.message);
        return false;
    }
};

/**
 * Checks if a user account exists for the given username.
 * * @param {string} username - The user's chosen identifier (e.g., "GamerTag123").
 * @returns {Promise<boolean>} A promise that resolves to true if the account exists, false otherwise.
 */
export const checkAccountExists = async (username) => {
    // 1. Construct the dummy email using the same suffix used during sign-up
    const dummyEmail = username + DOMAIN_SUFFIX;

    try {
        // 2. Call the Firebase function to check which sign-in methods are linked to this email.
        // If the email exists, the array will contain at least one method (e.g., 'password').
        const signInMethods = await fetchSignInMethodsForEmail(auth, dummyEmail);

        // 3. Return true if the array is not empty (meaning an account was found)
        return signInMethods.length > 0;

    } catch (error) {
        // If the operation fails for reasons other than "email not found" (e.g., network error,
        // invalid API key, etc.), it will throw an error.
        
        // Note: fetchSignInMethodsForEmail does *not* throw an error for a non-existent email,
        // it just returns an empty array. If a different error occurs, it should be logged.
        console.error("Error during account existence check:", error.message);
        throw error;
    }
};

export const submitBugReport = async (message) => {
    // 1. Get a reference to the 'bugReports' collection
    const bugReportsCollectionRef = collection(db, 'bugReports');

    // 2. Prepare the data payload
    const bugData = {
        message: message,
    };

    try {
        // 3. Use addDoc to write the data and get the document reference
        const docRef = await addDoc(bugReportsCollectionRef, bugData);

        console.log(`Bug report successfully submitted. Document ID: ${docRef.id}`);
        return docRef.id; // Return the new document ID

    } catch (e) {
        console.error("Error submitting bug report: ", e);
        // Rethrow the error so your calling code knows it failed
        throw new Error("Failed to submit bug report to database."); 
    }
};