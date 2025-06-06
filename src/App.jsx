import React from 'react'
import { Routes, Route } from 'react-router-dom'  
import Home from './pages/Home'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import EmailVerify from './pages/EmailVerify'
import Chat from './pages/Chat'
import { ToastContainer, toast } from 'react-toastify';

const App = () => {
  return (
    <div>
      <ToastContainer />
    <Routes>
      <Route path='/' element = {<Home/>} />
      <Route path='/login' element = {<Login/>} />
      <Route path='/reset-password' element = {<ResetPassword/>} />
      <Route path='/verify-account' element = {<EmailVerify/>} />
      <Route path='/chat' element = {<Chat/>} />
    </Routes>
    </div>
  )
}

export default App