import React from 'react'
import Header from '../components/Header'
import '../App.css'

export default function NotFound404 (props) {
    return(
        <>
            <Header theme={props.theme} themeSwitcher ={props.themeSwitcher}/>
            <p style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '200px'}}>404 Page Not found</p>
        </>
    )
}