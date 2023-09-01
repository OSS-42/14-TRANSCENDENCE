import {
  Grid,
  Box,
  Button,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
} from "@mui/material";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Match, User } from "../models/User";
import axios from "axios";
import { AvatarBox } from "../components/Profile/AvatarBox";
import { NameBox } from "../components/Profile/NameBox";
import { ContainerGrid } from "../components/Profile/ContainerGrid";
import { RightSideGrid } from "../components/Profile/RightSideGrid";
import { LeftSideGrid } from "../components/Profile/LeftSideGrid";
import { ChangeAvatarBox } from "../components/Profile/ChangeAvatarBox";
import { ChangeNameBox } from "../components/Profile/ChangeNameBox";
import { AboutBox } from "../components/Profile/AboutBox";
import { MatchHistoryBox } from "../components/Profile/MatchHistoryBox";
import { FriendsListBox } from "../components/Profile/FriendsListBox";
import { MatchHistory } from "../components/Profile/MatchHistory";

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
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUsersData();
  }, []);

  const handleAvatarSelected = (event: any) => {
    const selectedFile = event.target.files[0];
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

  // const FriendsList = () => {
  //   const [friends, setFriends] = useState(["No friends for the moment ..."]); // SetState. Initialize friend to empty array
  //   const jwt_token = Cookies.get("jwt_token"); // Cookies to identify user.

  //   useEffect(() => {
  //     const fetchFriends = async () => {
  //       try {
  //         const response = await axios.get(
  //           "http://localhost:3001/users/friendsList",
  //           {
  //             headers: {
  //               Authorization: "Bearer " + jwt_token,
  //             },
  //           }
  //         );
  //         console.log("Friends list fetching successful");
  //         console.log(response);
  //         setFriends(response.data); // Assuming the friend data is in the 'data' property of the response
  //       } catch (error) {
  //         console.error("Friends list fetching:", error);
  //       }
  //     };

  //     fetchFriends();
  //   }, []);

  //   return (
  //     <>
  //       <div>
  //         FRIENDS
  //         <ul>
  //           {friends.map((friend, index) => (
  //             <li key={index}>{friend}</li>
  //           ))}
  //         </ul>
  //       </div>
  //     </>
  //   );
  // };

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <NameBox user={user?.username} />
        <AvatarBox user={user} />
        <ChangeAvatarBox onChange={handleAvatarSelected} />
        <ChangeNameBox />
      </LeftSideGrid>
      <RightSideGrid>
        <AboutBox />
       <MatchHistoryBox>
          <MatchHistory user={user}/>
       </MatchHistoryBox>
        {/* <FriendsListBox>
          <FriendsList />
        </FriendsListBox> */}
      </RightSideGrid>
    </ContainerGrid>
  );
}
