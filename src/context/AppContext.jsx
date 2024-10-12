import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/fireBase";

export const AppContext = createContext();
const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatVisible, setChatVisibile] = useState(false);
  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      setUserData(userData);
      if (userData.avatar && userData.name) {
        // if the user have avatar and name then it will nevigate the user to chat page else it will redirect the user to profile update update page
        navigate("/chat");
      } else {
        navigate("/profile");
      }
      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });
      setInterval(async () => {
        // it will update the lastseen of the user after every 1 min
        if (auth.chatUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000);
    } catch (error) {}
  };

  useEffect(() => {
    //this loaded the chat data whenever userdata loaded and also it loaded the reciver details also
    if (userData) {
      //This ensures that the chat data is only fetched if userData (the logged-in user's information) is available.
      const chatRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data().chatsData;
        const tempData = [];
        for (const item of chatItems) {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          tempData.push({ ...item, userData });
        }
        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      });
      return () => {
        unSub();
      };
    }
  }, [userData]);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messages,
    setMessages,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisibile,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
