import ArrowBackSharpIcon from "@mui/icons-material/ArrowBackSharp";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import assets from "../../assets/assets";
import { db } from "../../config/fireBase";
import { AppContext } from "../../context/AppContext";
import upload from "../../lib/upload";
import "./ChatBox.css";

const ChatBox = () => {
  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisibile,
  } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    //to send the message which type by user
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          // to show recieve and sent messages
          const userChatRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30); //to display the last message
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatRef, {
              // to save the changes in the database
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
    setInput("");
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messagesId) {
        // update in databse
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });
        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          // to show recieve and sent messages
          const userChatRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = "Image"; //to display the last message
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatRef, {
              // to save the changes in the database
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    if (hour > 12) {
      return hour - 12 + ":" + min + "PM";
    } else {
      return hour + ":" + min + "AM";
    }
  };

  useEffect(() => {
    // this will display the message in the chat box
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
    }
  }, messagesId);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name}{" "}
          {Date.now() - chatUser.userData.lastSeen <= 70000 ? (
            <img className="dot" src={assets.green_dot} alt="" />
          ) : null}
        </p>
        <InfoOutlinedIcon className="help" />{" "}
        <ArrowBackSharpIcon
          onClick={() => setChatVisibile(false)}
          className="arrow"
        />
      </div>

      <div className="chat-msg">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg["image"] ? (
              <img className="msg-img" src={msg.image} alt="" />
            ) : (
              <p className="msg">{msg.text} </p>
            )}

            <div>
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar
                    : chatUser.userData.avatar
                }
                alt=""
              />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(event) => setInput(event.target.value)}
          value={input}
          type="text"
          className="frist-input"
          placeholder="send a message "
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image./jpeg"
          hidden
        />
        <label htmlFor="image">
          <CollectionsOutlinedIcon className="icon" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat Anytime,AnyWhere</p>
    </div>
  );
};

export default ChatBox;
