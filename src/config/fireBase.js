// @ts-check
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyBjr6nAcGU1xdBf3AX9JZ_Omi0QAUbRegA",
  authDomain: "chat-app-gs-b3dbb.firebaseapp.com",
  projectId: "chat-app-gs-b3dbb",
  storageBucket: "chat-app-gs-b3dbb.appspot.com",
  messagingSenderId: "602040078960",
  appId: "1:602040078960:web:8012b0e8e3d79bc0cfdab5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      //user collection :- store the data in firebase sotre
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey,There i am using Chat App",
      lastSeen: Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      // this chat collection will store the user chats and its friends deatails
      chatsData: [],
    });
  } catch (error) {
    console.log(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.log(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter valid Email address");
  }
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Resent Email Sent");
    } else {
      toast.error("email does not exits");
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message);
  }
};

export { auth, db, login, logout, resetPass, signup };
