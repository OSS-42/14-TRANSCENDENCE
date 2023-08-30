import { Grid, Box, Button, Avatar } from "@mui/material";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Match, User } from "../models/User";
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
  const [match, setMatch] = useState(); // SetState. Mentions that it is expecting a value of type Match.

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

  // This is the function to do get the matchmaking stats
  //   const matchMakingStats = () => {
  //     const jwt_token = Cookies.get("jwt_token"); // Token that identifies user

  //     useEffect(() => {
  //       const fetchMatch = async () => {
  //         try {
  //           const response = await axios.get("http://localhost:3001/users/matchHistory/" + user?.id.toString(), {
  //             headers: {
  //           	Authorization: "Bearer " + jwt_token,
  //             }
  //           });
  //           console.log("Match stats fetching successful");
  //           console.log(response);
  //           setMatch(response.data); // Assuming the friend data is in the 'data' property of the response
  // 		  console.log(match);
  //         } catch (error) {
  //           console.error("Match stats fetching:", error);
  //         }
  //       };

  //       fetchMatch();
  //     }, [user]);

  //   }

  // This is the function call that allows to connect the FriendLists Box with list of all friends
  // The code below becomes a component. It is identified as <FriendList/>
  //   const FriendsList = () => {
  //     const [friends, setFriends] = useState(["No friends for the moment ..."]); // SetState. Initialize friend to empty array
  //     const jwt_token = Cookies.get("jwt_token"); // Cookies to identify user.

  //     useEffect(() => {
  //       const fetchFriends = async () => {
  //         try {
  //           //Test qui force le contenu qui se trouve dans response.data
  //         //   const response = {
  //         //     data: ["Cesar", "Ana"],
  //         //   };
  //           const response = await axios.get("http://localhost:3001/users/friendsList", {
  //             headers: {
  //           	Authorization: "Bearer " + jwt_token,
  //             }
  //           });
  //           console.log("Friends list fetching successful");
  //           console.log(response);
  //           setFriends(response.data); // Assuming the friend data is in the 'data' property of the response
  //         } catch (error) {
  //           console.error("Friends list fetching:", error);
  //         }
  //       };

  //       fetchFriends();
  //     }, []);

  //     return (
  //       <>
  //         <div>
  //           <h1>FRIENDS</h1>
  //           <ul>
  //             {friends.map((friend, index) => (
  //               <li key={index}>{friend}</li>
  //             ))}
  //           </ul>
  //         </div>
  //       </>
  //     );
  //   };

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <NameBox />
        <Box
		  component="div"
          sx={{
            border: "1px solid black",
            borderRadius: "5px",
            margin: "20px",
            fontWeight: "bold",
            height: "30vh",
            width: "50%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Avatar
            alt="Username"
            src={user?.avatar}
            sx={{
              width: "100%", // Allow width to adjust
              height: "100%", // Fill the available height
              maxWidth: "100%",
            }}
          />
        </Box>
        {/* <AvatarBox user={user} /> */}
        <ChangeAvatarBox onChange={handleAvatarSelected} />
        <ChangeNameBox />
      </LeftSideGrid>
      <RightSideGrid>
        <ContentBox content="ABOUT" />
        <ContentBox content="STATS" />
        {/* <Box
          component="div"
          sx={{
            border: "1px solid black",
            borderRadius: "5px",
            margin: "20px",
            fontWeight: "bold",
            height: "28vh",
            maxHeight: "370px", // Set a maximum height for scrolling
            overflow: "auto", // Enable scrolling when content overflows
          }}
        >
          <FriendsList />
        </Box> */}
        {/* {matchMakingStats()} */}
      </RightSideGrid>
    </ContainerGrid>
  );
}
