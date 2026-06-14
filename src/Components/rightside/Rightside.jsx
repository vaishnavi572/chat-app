import React, { useContext, useEffect, useState } from 'react'
import './Rightside.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/Appcontext'

function Rightside() {
  const{chatuser,messages,userdata}=useContext(AppContext)
  const [msgImages,setmsgImages]=useState()

  useEffect(()=>{
      let tempvar=[]
      messages.map((msg)=>{
        if(msg.image){
          tempvar.push(msg.image)
        }
      })
      setmsgImages(tempvar)
  },[messages])

  return chatuser?(
    <div className='rs'>
      <div className="rs-profile">
        <img src={chatuser.userdata.avatar} alt="" />
        <h3>{chatuser.userdata.name}{Date.now()-chatuser.userdata.lastSeen<=7000?<img className='dot' src={assets.green_dot} alt=''/>:null}</h3>
        <p>{chatuser.userdata.bio}</p>
      </div>
      <hr />
      <div className="rs-media"><p>Media</p>
      <div>
        {msgImages.map((url,index)=>(<img onClick={()=>window.open(url)} key={index} src={url} alt=''/>))}
        {/* <img src={assets.pic1} alt="" />
        <img src={assets.pic2} alt="" />
        <img src={assets.pic3} alt="" />
        <img src={assets.pic4} alt="" />
        <img src={assets.pic1} alt="" />
        <img src={assets.pic2} alt="" /> */}
      </div>
      </div>
      <button onClick={()=>{logout()}}>LogOut</button>
    </div>
  ):(
    <div className='rs'>
      <button onClick={()=>logout()}>LogOut</button>
    </div>
  )

}

export default Rightside
