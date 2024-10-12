import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import assets from "../../assets/assets";
import { db } from "../../config/fireBase";
import { AppContext } from "../../context/AppContext";
import "./LeftSideBar.css";

const LeftSideBar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisibile,
  } = useContext(AppContext); // for user1(my assumptions)
  // state variable for showing result of the search bar
  const [user, setUser] = useState(null); //for user2(my assumptions)
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (event) => {
    try {
      const input = event.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExit = false;
          chatData.map((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExit = true;
            }
          });
          if (!userExit) {
            // agar already koi user add hai then woh search mai nhi aayaega
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null); // if we dont get any user with that username
        }
      } else {
        setShowSearch(false); // when we dont enter anything in the imput field
      }
    } catch (error) {}
  };

  const addChat = async () => {
    // this funtion add the searched user on your app chat
    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");
    try {
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(chatsRef, user.id), {
        // user2(my assumptions)
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
      // this just above and just below to funtion make the relation between two user
      await updateDoc(doc(chatsRef, userData.id), {
        //user1 (my assumptions)
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
      // this is used to display chat of that user which is selected from imput in leftside bar (from line 99-111)
      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();
      setChat({
        messagesId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      });
      setShowSearch(false);
      setChatVisibile(true);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const setChat = async (item) => {
    // to show the chat in chat box
    try {
      setMessagesId(item.messageId);
      setChatUser(item);
      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();
      console.log(userChatsData);
      const chatIndex = userChatsData.chatsData.findIndex(
        (c) => c.messageId === item.messageId
      );
      userChatsData.chatsData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData,
      });
      setChatVisibile(true);
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    const updateChatUserData = async () => {
      if (chatUser) {
        const userRef = doc(db, "users", chatUser.userData.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser((prev) => ({ ...prev, userData: userData }));
      }
    };
    updateChatUserData();
  }, [chatData]);
  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="" className="logo" />
          <div className="manu">
            <MenuIcon />
            <div className="sub-manu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <SearchIcon />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here..."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="" />
            <p>{user.name}</p>
          </div>
        ) : (
          Array.isArray(chatData) &&
          chatData.map((item, idx) => (
            <div
              onClick={() => setChat(item)}
              key={idx}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId
                  ? ""
                  : "border"
              }`}>
              <img src={item.userData.avatar} alt="" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span> {/* last message  */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSideBar;
