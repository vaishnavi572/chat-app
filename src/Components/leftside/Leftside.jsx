import React, { useContext, useState } from "react";
import "./leftside.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";

import {
  arrayUnion,
  collection,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { db } from "../../config/firebase";
import { AppContext } from "../../context/Appcontext";
import { toast } from "react-toastify";

function Leftside() {
  const navigate = useNavigate();

  const {
    userdata,
    chatdata,
    setmessageId,
    setchatuser,
    chatvisible,
    setchatvisible,
  } = useContext(AppContext);

  const [searchUsers, setSearchUsers] = useState([]);
  const [showsearch, setShowsearch] = useState(false);

  // ✅ GENERATE UNIQUE MESSAGE ID
  const getMessageId = (id1, id2) => {
    return id1 > id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
  };

  // 🔍 SEARCH USERS
  const inputhandler = async (e) => {
    const input = e.target.value.toLowerCase().trim();

    if (!input) {
      setShowsearch(false);
      setSearchUsers([]);
      return;
    }

    setShowsearch(true);

    try {
      const userRef = collection(db, "users");
      const snapshot = await getDocs(userRef);

      const allUsers = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }));

      const filtered = allUsers.filter(
        (user) =>
          user.uid !== userdata.uid &&
          (user.name?.toLowerCase().includes(input) ||
            user.username?.toLowerCase().includes(input))
      );

      setSearchUsers(filtered);
    } catch (err) {
      console.log(err);
      toast.error("Search failed");
    }
  };

  // 💬 OPEN CHAT
  const setchat = async (item) => {
    try {
      setmessageId(item.messageId);
      setchatuser(item);

      const userChatsRef = doc(db, "chats", userdata.uid);

      const snap = await getDoc(userChatsRef);

      if (!snap.exists()) return;

      const chats = snap.data().chatsData || [];

      const updatedChats = chats.map((chat) =>
        chat.messageId === item.messageId
          ? { ...chat, messageSeen: true }
          : chat
      );

      await updateDoc(userChatsRef, {
        chatsData: updatedChats,
      });

      setchatvisible(true);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // ➕ CREATE CHAT
  const addchat = async (user) => {
    try {
      const messageId = getMessageId(userdata.uid, user.uid);

      const messageRef = doc(db, "messages", messageId);

      const snap = await getDoc(messageRef);

      // ✅ Create message document if not exists
      if (!snap.exists()) {
        await setDoc(messageRef, {
          createdAt: Date.now(),
          messages: [],
        });
      }

      // ✅ Add chat for current user
      await setDoc(
        doc(db, "chats", userdata.uid),
        {
          chatsData: arrayUnion({
            messageId,
            rID: user.uid,
            updatedAt: Date.now(),
            messageSeen: true,
          }),
        },
        { merge: true }
      );

      // ✅ Add chat for other user
      await setDoc(
        doc(db, "chats", user.uid),
        {
          chatsData: arrayUnion({
            messageId,
            rID: userdata.uid,
            updatedAt: Date.now(),
            messageSeen: false,
          }),
        },
        { merge: true }
      );

      // ✅ SET CURRENT CHAT
      setmessageId(messageId);

      setchatuser({
        ...user,
        messageId,
      });

      setchatvisible(true);

      toast.success("Chat created");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className={`ls ${chatvisible ? "hidden" : ""}`}>
      {/* TOP */}
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="" />

          <div className="menu">
            <img src={assets.menu_icon} alt="" />

            <div className="sub-menu">
              <p onClick={() => navigate("/Profileupdate")}>
                Edit Profile
              </p>

              <hr />

              <p>Logout</p>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />

          <input
            onChange={inputhandler}
            type="text"
            placeholder="Search user"
          />
        </div>
      </div>

      {/* LIST */}
      <div className="ls-list">
        {/* SEARCH RESULTS */}
        {showsearch && searchUsers.length > 0 ? (
          searchUsers.map((user, index) => (
            <div
              key={index}
              onClick={() => addchat(user)}
              className="ls-friends add-user"
            >
              <img
                src={user.avatar || assets.profile_img}
                alt=""
              />

              <p>{user.name}</p>
            </div>
          ))
        ) : (
          (chatdata || []).map((item, index) => (
            <div
              key={index}
              onClick={() => setchat(item)}
              className={`ls-friends ${
                item.messageSeen === false ? "unread" : ""
              }`}
            >
              <img
                src={
                  item?.userdata?.avatar ||
                  assets.profile_img
                }
                alt=""
              />

              <div>
                <p>{item?.userdata?.name || "No Name"}</p>

                <span>
                  {item?.lastMessage ||
                    item?.userdata?.bio ||
                    "No message yet"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Leftside;
