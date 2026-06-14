import React, { useContext, useEffect, useState } from 'react'
import './chat.css'
import Leftside from '../../Components/leftside/Leftside'
import Rightside from '../../Components/rightside/Rightside'
import Chatbox from '../../Components/chatbox/Chatbox'
import { AppContext } from '../../context/Appcontext'

function Chat() {
  const {chatdata,userdata}=useContext(AppContext)
  const[loading,setloading]=useState(true)
  useEffect(()=>{
    if(chatdata,userdata){
    setloading(false)
    }

  },[chatdata,userdata])
  return (
    <div className='chat'>
      {
      loading?<p className='loading'>Loading...</p>:<div className='chat-container'>
      <Leftside/>
       <Chatbox/>
      <Rightside/>
      </div>
     
}
</div>
)
}

export default Chat
