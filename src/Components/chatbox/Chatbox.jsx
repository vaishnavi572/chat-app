import React, { useContext, useEffect, useState } from 'react'
import './chatbox.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/Appcontext'
import { arrayUnion, doc, onSnapshot, updateDoc,getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/upload'

function Chatbox() {
  const { userdata, messageId, setmessages, chatuser, messages,chatvisible,setchatvisible } = useContext(AppContext)
  const [input, setinput] = useState("")

  // ✅ FIXED SEND MESSAGE (ONLY FIRESTORE TIMESTAMP)
const sendmessage = async () => {
  if (!input.trim() || !messageId) return;

  try {
    const newMessage = {
      sId: userdata.uid,
      text: input,
      createdAt: Date.now(),
    };

    // ✅ 1. store message
    await updateDoc(doc(db, "messages", messageId), {
      messages: arrayUnion(newMessage),
    });

    // ✅ 2. update sender chat list
    const senderRef = doc(db, "chats", userdata.uid);
    const senderSnap = await getDoc(senderRef);

    if (senderSnap.exists()) {
      const updatedChats = senderSnap.data().chatsData.map(chat =>
        chat.messageId === messageId
          ? { ...chat, lastMessage: input, updatedAt: Date.now() }
          : chat
      );

      await updateDoc(senderRef, { chatsData: updatedChats });
    }

    // ✅ 3. update receiver chat list
    const receiverId = chatuser?.userdata?.uid;
    const receiverRef = doc(db, "chats", receiverId);
    const receiverSnap = await getDoc(receiverRef);

    if (receiverSnap.exists()) {
      const updatedChats = receiverSnap.data().chatsData.map(chat =>
        chat.messageId === messageId
          ? {
              ...chat,
              lastMessage: input,
              updatedAt: Date.now(),
              messageSeen: false
            }
          : chat
      );

      await updateDoc(receiverRef, { chatsData: updatedChats });
    }

    setinput("");
  }catch (error) {
  console.log("FULL ERROR 👉", error);
  toast.error(error.message);
}
};
const sendImage = async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;

    const fileurl = await upload(file);

    if (fileurl && messageId) {
      const newMessage = {
        sId: userdata.uid,
        image: fileurl,
        createdAt: new Date() // ✅ FIXED
      };

      await updateDoc(doc(db, "messages", messageId), {
        messages: arrayUnion(newMessage)
      });
    }

    e.target.value = "";

  } catch (error) {
    console.log(error);
    toast.error("Image sending failed");
  }
};
 console.log("Current messageId:", messageId);
  // ✅ FIXED TIME FUNCTION
  const converttimesatp = (timestamp) => {
    if (!timestamp) return "";

    const date = timestamp instanceof Date
      ? timestamp
      : timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);

    let hour = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hour >= 12 ? "pm" : "am";
    hour = hour % 12 || 12;

    return `${hour}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
  }

  // ✅ FIXED REAL-TIME LISTENER
useEffect(() => {
  if (!messageId) return;

  const unsub = onSnapshot(doc(db, "messages", messageId), (snap) => {
    const data = snap.data();
    const msgs = data?.messages || [];

// sort by time (old → new)
const sorted = msgs.sort((a, b) => a.createdAt - b.createdAt);

setmessages([...sorted]);
  });

  return () => unsub();
}, [messageId]);

  return chatuser ? (
    <div className={`chatbox ${chatvisible?"":"hidden"}`}>
      <div className="chatuser">
        <img src={chatuser?.userdata?.avatar} alt='' />
        <p>
  {chatuser?.userdata?.name}

  {Date.now() - (chatuser?.userdata?.lastSeen || 0) <= 7000 ? (
    <img className="dot" src={assets.green_dot} alt="" />
  ) : null}
</p>
        <img src={assets.help_icon} className='help' alt='' />
        <img src={assets.arrow_icon} className='arrow'onClick={()=>setchatvisible(false)} alt="" />
      </div>

      <div className="chatmessage">
        {messages.map((message, index) => (
          <div key={index} className={message.sId === userdata.uid ? 's-msg' : 'r-msg'}>
           {message.image ? (
  <img className="message-img" src={message.image} alt="" />
) : message.text ? (
  <p className="msg">{message.text}</p>
) : null}
           
            <div>
              <img
                src={message.sId === userdata.uid ? userdata.avatar : chatuser.userdata.avatar}
                alt=""
              />
              <p>{converttimesatp(message.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setinput(e.target.value)}
          value={input}
          type='text'
          placeholder='send a message'
        />

        <input onChange={sendImage}type='file' id='image' accept='image/png , image/jpeg' hidden />

        <label htmlFor='image'>
          <img src={assets.gallery_icon} alt='' />
        </label>

        <img onClick={sendmessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chatname ${chatvisible?"":"hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime anywhere</p>
    </div>
  )
}

export default Chatbox
