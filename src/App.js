import './App.css';
import { useEffect, useState } from 'react';
import useLocalStorage from 'use-local-storage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ReactModal from 'react-modal';
import NotFound404 from './pages/NotFound404';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  // const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');

  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const { currentUser } = useAuth();
  const setDarkMode=()=>{
document.querySelector("body").setAttribute("data-theme","dark")
  }
  const setLightMode=()=>{
    document.querySelector("body").setAttribute("data-theme","light")
      }
  const switchThemeHandler = (e,newTheme = null) => {
    if(newTheme==='light') setLightMode()
    if(newTheme==='dark') setDarkMode()
    if(newTheme){
      // console.log(newTheme)
      setTheme(newTheme);
      return;
    }
    else{
      newTheme = (theme === 'light' ? 'dark' : 'light');
      setTheme(newTheme);
    }
    console.log(newTheme)
   
  }

  return (
    <div data-theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path = "/" element = {
            currentUser?
            <Navigate to="/dashboard"/> 
            :
            <Home 
              theme={theme} 
              themeSwitcher = {switchThemeHandler}
            />         
          }
          />
          <Route path='/dashboard' element = {
            <PrivateRoute>
              <Dashboard 
                theme={theme} 
                themeSwitcher = {switchThemeHandler}
              />
            </PrivateRoute>
            }
          />
          
          <Route path = '*' element={
            <Navigate to='/dashboard'/>}
          />
        </Routes>
      </BrowserRouter>
      </div>
  );
}

export default App;
