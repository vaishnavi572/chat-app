import React from 'react'
import assets from '../../../assets/assets'
import './login.css'
import { useState } from 'react'
import { signup,login, resetpass } from '../../../config/firebase'

const Login = () => {
  const [currentState, setCurrentState] = useState('signup');
  const[userName,setUsername]=useState('')
  const[email,setEmail]=useState('')
  const[password,setPassword]=useState('')
  const handleSubmit=async (e)=>{
    e.preventDefault();
    if(currentState==='signup'){
      await signup(userName,email,password)
      console.log("button clicked");  
    }
    else{
      await login(email,password)
      console.log("login button clicked");
    }
  }

  return (
    <div className='login'>
      <img src={assets.logo_big} alt='' className='logo'/>
      <form onSubmit={handleSubmit} className='loginform'>
        <h2>{currentState}</h2>
       {currentState=="signup"?<input onChange={(e)=>{setUsername(e.target.value)}} value={userName} type="text" className="form_input" placeholder="Username" required/>:null}
        <input onChange={(e)=>{setEmail(e.target.value)}} value={email} type="email" className="form_input" placeholder="Email" required/>
        <input onChange={(e)=>{setPassword(e.target.value)}} value={password} type="password" className="form_input" placeholder="Password" required/>
        <button type="submit" className='submit'>{currentState=='signup'?'Create account':'login now'}</button>
        <div className="login_term">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>
        <div className="login_forgot">
          {currentState=='signup'?<p className='login-toggle'>Already have an account? <span onClick={()=>setCurrentState('login')}>click here</span></p>:<p className='login-toggle'>create an account <span onClick={()=>setCurrentState('signup')}>click here</span></p>}
          {currentState=='login'?<p className='login-toggle'>Already have an account? <span onClick={()=>resetpass(email)}>reset here</span></p>:null}

        </div>
      </form>
    </div>
  )
}

export default Login
