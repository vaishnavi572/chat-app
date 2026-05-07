import { createContext, useEffect, useState } from "react";
import { db, auth } from "../config/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const Appcontextprovider = (props) => {
  const [userdata, setUserdata] = useState(null);
  const [chatdata, setChatdata] = useState([]);
  const [messageId, setmessageId] = useState(null);
  const [messages, setmessages] = useState([]);
  const [chatuser, setchatuser] = useState(null);
  const[chatvisible,setchatvisible]=useState(false)

  const navigate = useNavigate();

  // ✅ Load user
  const loaduserdata = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const data = userSnap.data();
      setUserdata({ ...data, uid });

      if (data?.avatar && data?.name) {
        navigate("/chat");
      } else {
        navigate("/profileupdate");
      }

      if (!window.userInterval) {
        window.userInterval = setInterval(async () => {
          if (auth.currentUser) {
            await updateDoc(userRef, {
              lastSeen: Date.now(),
            });
          }
        }, 6000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Load chats
  useEffect(() => {
    if (!userdata) return;

    const chatRef = doc(db, "chats", userdata.uid);

    const unsub = onSnapshot(chatRef, async (snap) => {
      if (!snap.exists()) {
        setChatdata([]);
        return;
      }

      const chatitems = snap.data()?.chatsData || [];

      const temp = await Promise.all(
        chatitems.map(async (item) => {
          const userRef = doc(db, "users", item.rID);
          const userSnap = await getDoc(userRef);

          return {
            ...item,
            userdata: userSnap.exists() ? userSnap.data() : null,
          };
        })
      );

      setChatdata(temp.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => unsub();
  }, [userdata]);

  return (
    <AppContext.Provider
      value={{
        userdata,
        setUserdata,
        chatdata,
        setChatdata,
        loaduserdata,
        messages,
        setmessages,
        messageId,
        setmessageId,
        chatuser,
        setchatuser,
        chatvisible,
        setchatvisible
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export default Appcontextprovider;