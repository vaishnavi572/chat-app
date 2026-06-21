import React, { useContext, useEffect, useState } from 'react'
import './rightside.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/Appcontext'

function Rightside() {
  const { chatuser, messages, userdata } = useContext(AppContext)

  // FIX: initialize as empty array
  const [msgImages, setmsgImages] = useState([])

  useEffect(() => {
    let tempvar = []

    // FIX: check messages exists
    messages?.forEach((msg) => {
      if (msg.image) {
        tempvar.push(msg.image)
      }
    })

    setmsgImages(tempvar)
  }, [messages])

  return chatuser ? (
    <div className='rs'>
      <div className="rs-profile">

        {/* FIX: optional chaining */}
        <img src={chatuser?.userdata?.avatar || assets.avatar_icon} alt="" />

        <h3>
          {chatuser?.userdata?.name}
          {Date.now() - (chatuser?.userdata?.lastSeen || 0) <= 7000 ? (
            <img className='dot' src={assets.green_dot} alt='' />
          ) : null}
        </h3>

        <p>{chatuser?.userdata?.bio}</p>
      </div>

      <hr />

      <div className="rs-media">
        <p>Media</p>

        <div>
          {msgImages.map((url, index) => (
            <img
              onClick={() => window.open(url)}
              key={index}
              src={url}
              alt=''
            />
          ))}
        </div>
      </div>

      <button
        onClick={async () => {
          await logout()
        }}
      >
        LogOut
      </button>
    </div>
  ) : (
    <div className='rs'>
      <button
        onClick={async () => {
          await logout()
        }}
      >
        LogOut
      </button>
    </div>
  )
}

export default Rightside
