import React, { useContext, useState, useEffect } from 'react'
import { auth,db } from '../firebase'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, 
    signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signInWithPhoneNumber } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const AuthContext = React.createContext()
const googleProvider = new GoogleAuthProvider();

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider ({ children }){
    const [currentUser,setCurrentUser] = useState()
    const [loading,setLoading] = useState(true)

    
    async function signup(userInfo, email, password){
            const userCredential = await createUserWithEmailAndPassword(auth,email,password)
            // create a user in firestore
            const user = userCredential.user;

            // add user to firestore
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const docSetStatus = await setDoc(userDocRef, {
                ...userInfo,
                uid: user.uid,
                email: user.email,
                createdAt: new Date(),
                provider: "0"
            });
            // console.log(docSetStatus)

            return userCredential
    }
    async function googleLogin(){
        try{
            const userCredential = await  signInWithPopup(auth, googleProvider);
            const user = userCredential.user;
            // console.log(user);
            // add user to firestore
            const db = getFirestore();
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if(!userDocSnap.exists()){ 
                // User doesn't exist, create a new document
                const docSetStatus = await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    createdAt: new Date(),
                    image_url: user.photoURL,
                    provider: "2"
                });
            }
            else{
                // User exists, update the document
                const docUpdateStatus = await updateDoc(userDocRef, {
                    email: user.email,
                    name: user.displayName,
                    image_url: user.photoURL,
                    provider: "2"
                });
            }
        } catch(err){
            window.alert(err.message)
        }
    }
    function login(email,password){
        return signInWithEmailAndPassword(auth, email,password)
    }
    async function phoneLoginGetCofirmationResult(phoneNumber) {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
        window.confirmationResult = confirmationResult;
        return confirmationResult
        // .then((confirmationResult) => {
        //     // SMS sent. Prompt user to type the code from the message, then sign the
        //     // user in with confirmationResult.confirm(code).
        //     window.confirmationResult = confirmationResult;
        //     confirmationResult.confirm(code).then((result) => {
        //         console.log(result)
        //     })
        // })
    }
    async function phoneLoginWithOtp(confirmationResult, otp,mobile){
        const result = await confirmationResult.confirm(otp)
        const user = result.user;
        const db = getFirestore();
        
        const userDocRef = doc(db, 'users', user.uid);
        try {
            // Check if the document with the given UID already exists
            const docSnapshot = await getDoc(userDocRef);
        
            if (!docSnapshot.exists()) {
              // Document does not exist, create a new document
              const docSetStatus = await setDoc(userDocRef, {
                uid: user.uid,
                mobile: mobile,
                createdAt: new Date(),
                provider: "1",
              });
            }
          } catch (error) {
            console.error("Error checking document existence or creating document:", error);
          }

        return result
    }
    function sendResetPasswordEmail(email){
        return sendPasswordResetEmail(auth, email);
    }
    function logout(){
        return signOut(auth);
    }
    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe
    },[])

    const value = {
        currentUser,
        signup,
        login,
        googleLogin,
        sendResetPasswordEmail,
        phoneLoginGetCofirmationResult,
        phoneLoginWithOtp,
        logout
    }
    return(
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}