import React, { useState, useEffect } from 'react'
import './LoginPhone.css'
import { useAuth } from '../contexts/AuthContext'
import { RecaptchaVerifier, getAuth } from 'firebase/auth';
import { CircularProgress } from '@mui/material';
import { auth,db } from '../firebase';
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPhone(props) {
    const [rawPhoneNumber,setRawPhoneNumber] = useState(''); //without country code
    const [phoneNumber,setPhoneNumber] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [otp, setOtp] = useState('');
    const [enteringOtpState, setEnteringOtpState] = useState(false); 
    const [errorMessage, setErrorMessage] = useState('');
    const [otpSentMessage, setOtpSentMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { phoneLoginGetCofirmationResult, phoneLoginWithOtp } = useAuth();
   
    const handleGetConfirmResult = async(e) => {
        setLoading(true);
       
        try{
            e.preventDefault();
            setErrorMessage('');
            setOtpSentMessage('');
            // generateRecaptcha();

            const q = query(collection(db, "users"), where("mobile", "==", rawPhoneNumber));
            const querySnapshot = await getDocs(q);
            // console.log(querySnapshot);
            var userFound = false;
            if(!querySnapshot.empty){
                querySnapshot.forEach((doc) => {
                    const provider = doc.get("provider");
                    const email = doc.get("email");
                    if (provider === "0" || provider === "2") {
                        setErrorMessage("User "+ email + " with  this phone number already exists. Please login with Google or Email and Password.")
                        setLoading(false);
                        userFound = true;
                        return;
                    } 
                });
            }
            if(userFound){
                return;
            }

            const result = await phoneLoginGetCofirmationResult(phoneNumber);
            if(result){
                setEnteringOtpState(true);
                setConfirmationResult(result);
                setOtpSentMessage("OTP sent to " + phoneNumber);
            }
            else{
                setErrorMessage("Failed to send OTP. Try again");
            }
            
        } catch (e){
            setErrorMessage(e.message + "Try entering and sending OTP again or reloading page.");
        }
        setLoading(false);
    }

    const handlePhoneLogin = async() => {
        setLoading(true)
        try{
            const loginResult = await phoneLoginWithOtp(confirmationResult,otp,rawPhoneNumber)
        }
        catch(e){
            setErrorMessage(e.message)
        }
        setLoading(false)
    }
    useEffect(() => {
        if(!window.recaptchaVerifier){
            window.recaptchaVerifier = new RecaptchaVerifier('get-otp-button', {
                'size': 'invisible',
                'callback': (response) => {
                }
            },auth)
        }
        //clear on unmount
        return () => {
            if(window.recaptchaVerifier){
                window.recaptchaVerifier = null
            }
        }
    },[])
    return (
        <div className='phone-login-container' data-theme={props.theme}>
            <div style={{textAlign: 'center'}}>
                <h4>Enter Phone Number to get OTP</h4>
                <p>(Default Country Code: +91)</p>
            </div>
            <input type='string' placeholder='Phone Number ' onChange={ (e) => {setPhoneNumber('+91'+e.target.value); setRawPhoneNumber(e.target.value)} }/>
            <button type='submit' onClick={handleGetConfirmResult} id='get-otp-button'>Get OTP</button>

            {enteringOtpState &&
                <div className="" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                    <input placeholder='Enter OTP' onChange={ (e) => {setOtp(e.target.value)} }/>
                    <button onClick={handlePhoneLogin} >Login</button>
                </div>
            }
            <p style={{color: 'red', textAlign: 'center'}}>{errorMessage}</p>
            <p style={{color: 'green', textAlign: 'center'}}>{otpSentMessage}</p>
            {loading && <CircularProgress sx={props.theme ==='light' ? { color: 'black' }: {color: 'white'} }/>}
        </div>
    )
}
