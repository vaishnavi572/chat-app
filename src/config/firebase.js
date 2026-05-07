//this file get from firebase documentation
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";  
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvX1M9yXvUQkiJFklNaAxIXeyRt2XGaww",
  authDomain: "chat-app-gs-b6d6a.firebaseapp.com",
  projectId: "chat-app-gs-b6d6a",
  storageBucket: "chat-app-gs-b6d6a.firebasestorage.app",
  messagingSenderId: "327899057143",
  appId: "1:327899057143:web:8d29fe7e3cd6c46ffe3cf2",
  measurementId: "G-4F8GY3BN66"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const signup=async (username,email,password)=>{
    try {
        const result=await createUserWithEmailAndPassword(auth,email,password);
        const user=result.user;
        await setDoc(doc(db,'users',user.uid),{
            uid:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",  
            bio:"het there i am using chat app",
            lastseen:Date.now()
        })
        await setDoc(doc(db,'chats',user.uid),{
            chatdata:[]
        })
    } catch (error) {
        console.log(error);
         toast .error(error.message.split('/')[1].split('-').join(' '))
    }   
}
const login=async (email,password)=>{
    try {
        await signInWithEmailAndPassword(auth,email,password)
    } catch (error) {
        console.log(error);
        toast .error(error.message.split('/')[1].split('-').join(' '))
    }
}
const logout=async ()=>{
   
    try {
         await signOut(auth);
    } catch (error) {
         console.log(error);
        toast .error(error.message.split('/')[1].split('-').join(' ')) 
    }
}
const resetpass=async(email)=>{
    if(!email){
        toast.error("enter your email")
        return null
    }
    try {
        const userRef=collection(db,'users')
        const q=query(userRef,where('email','==',email))
        const querysnap=await getDocs(q)
        if(!querysnap.empty){
            await sendPasswordResetEmail(auth,email)
            toast.success('reset email sent')
        }
        else{
            toast.error('email does not exist')
        }

    } catch (error) {
        console.error(error)
        toast.error(error.message)
    }
}
export {auth,db,signup,login,logout,resetpass}
