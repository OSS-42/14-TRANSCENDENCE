import { Grid, Box, Button, Avatar } from "@mui/material";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { User } from "../models/User";
import axios from "axios";
import { AvatarBox } from "../components/Profile/AvatarBox";
import { NameBox } from "../components/Profile/NameBox";
import { ContentBox } from "../components/Profile/ContentBox";
import { ContainerGrid } from "../components/Profile/ContainerGrid";
import { RightSideGrid } from "../components/Profile/RightSideGrid";
import { LeftSideGrid } from "../components/Profile/LeftSideGrid";
import { ChangeAvatarBox } from "../components/Profile/ChangeAvatarBox";
import { ChangeNameBox } from "../components/Profile/ChangeNameBox";

export function Profile() {
  const [user, setUser] = useState<User>();
  const [selectedAvatar, setSelectedAvatar] = useState(null); // This set the selectedAvatar variable to null.

  useEffect(() => {
    async function fetchUsersData() {
      const jwt_token = Cookies.get("jwt_token");
      try {
        const response = await axios.get("http://localhost:3001/users/me", {
          headers: {
            Authorization: "Bearer " + jwt_token,
          },
        });
        setUser(response.data);
        console.log(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUsersData();
  }, []);


  const handleAvatarSelected = (event) => {
    const selectedFile = event.target.files[0];
    //console.log(selectedFile);                      // To be removed
    if (selectedFile) {
      setSelectedAvatar(selectedFile);
      handleAvatarUpdate(selectedFile);
    }
  };

  const handleAvatarUpdate = async (avatarFile: File) => {
    const formData = new FormData();
    console.log(avatarFile);
    formData.append("avatar", avatarFile);
    const jwt_token = Cookies.get("jwt_token");

    try {
      await axios.post("http://localhost:3001/users/updateAvatar", formData, {
        headers: {
          Authorization: "Bearer " + jwt_token,
        },
      });
      console.log("Avatar updated successfully");
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  return (
	<ContainerGrid>
      <LeftSideGrid>
		<NameBox />           
		<AvatarBox user={user}/>
		<ChangeAvatarBox onChange={handleAvatarSelected}/>
		<ChangeNameBox/>
	  </LeftSideGrid>
	 <RightSideGrid>
		<ContentBox content="ABOUT"/>
		<ContentBox content="STATS"/>
		<ContentBox content="FRIENDS LIST"/>
	 </RightSideGrid>
    </ContainerGrid>
  );
}
