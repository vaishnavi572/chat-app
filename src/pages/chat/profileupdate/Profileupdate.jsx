import React, { useContext, useEffect, useState } from 'react'
import './profileupdate.css'
import assets from '../../../assets/assets'
import { auth, db } from "../../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../../lib/upload'; 
import { AppContext } from '../../../context/appcontext';

function Profileupdate() {
  const [image, setImage] = useState(false)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [uid, setuid] = useState("")
  const [prev, setprev] = useState("")
  const { setUserdata } = useContext(AppContext)

  const navigate = useNavigate()

  const profileupdate = async (e) => {
    e.preventDefault()

    try {
      const user = auth.currentUser;

      if (!user) {
        toast.error("User not logged in")
        return;
      }

      if (!prev && !image) {
        toast.error("Please upload profile picture")
        return;
      }

      if (!name.trim() || !bio.trim()) {
        toast.error("Name and Bio cannot be empty")
        return;
      }

      const docRef = doc(db, 'users', user.uid)

      let imageurl = prev;

      // Upload image only if new image selected
      if (image) {
        console.log("Uploading image...");
        const uploadedUrl = await upload(image)

        if (!uploadedUrl) {
          toast.error("Image upload failed")
          return;
        }

        imageurl = uploadedUrl
        setprev(imageurl)
      }

      await updateDoc(docRef, {
        avatar: imageurl,
        bio: bio,
        name: name
      })

      const snap = await getDoc(docRef)
      setUserdata(snap.data())

      toast.success("Profile updated successfully")
      navigate('/chat')

    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setuid(user.uid)

        try {
          const docRef = doc(db, "users", user.uid);
          const docsnap = await getDoc(docRef)

          if (docsnap.exists()) {
            const data = docsnap.data()

            setName(data.name || "")
            setBio(data.bio || "")
            setprev(data.avatar || "")
          }
        } catch (err) {
          console.error(err)
          toast.error("Failed to fetch user data")
        }

      } else {
        navigate('/login')
      }
    })

    return () => unsubscribe()
  }, [navigate])

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileupdate}>
          <h3>Profile Details</h3>

          <label htmlFor='avatar'>
            <input
              onChange={(e) => {
                setImage(e.target.files[0])
              }}
              type='file'
              id='avatar'
              accept='.png,.jpg,.jpeg'
              hidden
            />

            <img
              src={
                image
                  ? URL.createObjectURL(image)
                  : prev
                    ? prev
                    : assets.avatar_icon
              }
              alt=""
            />
            upload profile image
          </label>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder='Your Name'
            required
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder='Write Profile Bio'
            required
          ></textarea>

          <button type='submit'>Save</button>
        </form>

        <img
          className='profile-pic'
          src={
            image
              ? URL.createObjectURL(image)
              : prev
                ? prev
                : assets.avatar_icon
          }
          alt=""
        />
      </div>
    </div>
  )
}

export default Profileupdate