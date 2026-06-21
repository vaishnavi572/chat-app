import React, { useContext, useEffect } from 'react'
import { Routes, useNavigate } from 'react-router-dom'
import { Route } from 'react-router-dom'
import Chat from './pages/chat/Chat'
import Login from './pages/chat/login/Login'
import Profileupdate from './pages/chat/profileupdate/Profileupdate'
import { auth,db,signup,login } from './config/firebase'
  import { ToastContainer, toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth'
import { AppContext } from './context/Appcontext'


const App = () => {
  const navigate=useNavigate();
  const {loaduserdata}=useContext(AppContext);
useEffect(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loaduserdata(user.uid) 
    } else {
      navigate('/login')
    }
  })
}, [navigate])
  return (
    <>
    <ToastContainer />
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/login' element={<Login />} />
      <Route path='/chat' element={<Chat />} />
      <Route path='/profileupdate' element={<Profileupdate />} />
    </Routes>
    </>
  )
}

export default App
