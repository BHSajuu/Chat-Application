import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import assets from "../../assets/assets";
import { auth, db } from "../../config/fireBase";
import { AppContext } from "../../context/AppContext";
import upload from "../../lib/upload";
import "./ProfileUpdate.css";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  let [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("Hey,There I am using Chat App");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);

  const profileUpdateHandler = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("upload Profile Picture");
      }
      const docRef = doc(db, "users", uid);
      if (image) {
        const imageUrl = await upload(image);
        setPrevImage(imageUrl);
        await updateDoc(docRef, {
          avatar: imageUrl,
          bio: bio,
          name: name,
        });
      } else {
        await updateDoc(docRef, {
          bio: bio,
          name: name,
        });
      }
      const snap = await getDoc(docRef); // after that our userData will be updated with image bio and name
      setUserData(snap.data());
      navigate("/chat");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.data().name) {
          setName(docSnap.data().name);
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio);
        }
        if (docSnap.data().avatar) {
          setPrevImage(docSnap.data().avatar);
        }
      } else {
        navigate("/");
      }
    });
  }, []);

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdateHandler}>
          <h3>Profile Details </h3>
          <label htmlFor="avatar">
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : assets.avatar_icon}
              alt=""
            />
            upload Profile Image
          </label>
          <TextField
            onChange={(event) => setName(event.target.value)}
            value={name}
            label="Your Name "
            variant="outlined"
            required
          />
          <TextField
            onChange={(event) => setBio(event.target.value)}
            value={bio}
            label="Write profile Bio"
            multiline
            maxRows={10}
            variant="standard"
            required
          />
          <Button type="submit" variant="contained">
            Save
          </Button>
        </form>
        <img
          className="profile-pic"
          src={
            image
              ? URL.createObjectURL(image)
              : prevImage
              ? prevImage
              : assets.logo_icon
          }
          alt=""
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
