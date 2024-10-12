import React, { useContext, useEffect, useState } from "react";
import ChatBox from "../../components/ChatBox/ChatBox";
import LeftSidebar from "../../components/leftSideBar/LeftSideBar";
import RightSideBar from "../../components/RightSideBar/RightSideBar";
import { AppContext } from "../../context/AppContext";
import "./Chat.css";
const Chat = () => {
  const { chatData, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(chatData && userData){
      setLoading(false);
    }
  },[chatData,userData])

  return (
    <div className="chat">
      {loading ? (
        <p className="loading">Loading....</p>
      ) : (
        <div className="chat-containter">
          <LeftSidebar />
          <ChatBox />
          <RightSideBar />
        </div>
      )}
    </div>
  );
};

export default Chat;
