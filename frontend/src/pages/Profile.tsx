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
import { MatchStatsBox } from "../components/Profile/MatchStatsBox";
import { FriendsListBox } from "../components/Profile/FriendsListBox";

export function Profile() {
  const [user, setUser] = useState<User>();
  const [selectedAvatar, setSelectedAvatar] = useState(null); // This set the selectedAvatar variable to null.
  const [match, setMatch] = useState({}); // SetState. Mentions that it is expecting a value of type Match.

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
  const MatchMakingStats = () => {
    const jwt_token = Cookies.get("jwt_token"); // Token that identifies user

    useEffect(() => {
      const fetchMatch = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3001/users/matchHistory/" + user?.id.toString(),
            {
              headers: {
                Authorization: "Bearer " + jwt_token,
              },
            }
          );
          console.log("Match stats fetching successful");
          console.log(response.data);
          setMatch(response.data);
        } catch (error) {
          console.error("Match stats fetching:", error);
        }
      };

      fetchMatch();
    }, [user]);

    if (!match.matchesWon) {
      return <p>No match data available.</p>;
    }

    return (
      <TableContainer component={Paper} sx={{ backgroundColor: "white" }} >
        <Typography variant="h6" sx={{ padding: "16px" }}>
          Match History
        </Typography>
        <Table >
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Winner</TableCell>
              <TableCell>Loser</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {match.matchesWon.map((matches, index) => (
              <TableRow key={index}>
                <TableCell>{matches.date}</TableCell>
                <TableCell>{matches.winner}</TableCell>
                <TableCell>{matches.loser}</TableCell>
              </TableRow>
            ))}
			{match.matchesLost.map((matches, index) => (
              <TableRow key={index}>
                <TableCell>{matches.date}</TableCell>
                <TableCell>{matches.winner}</TableCell>
                <TableCell>{matches.loser}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  //   This is the function call that allows to connect the FriendLists Box with list of all friends
  //   The code below becomes a component. It is identified as <FriendList/>
  const FriendsList = () => {
    const [friends, setFriends] = useState(["No friends for the moment ..."]); // SetState. Initialize friend to empty array
    const jwt_token = Cookies.get("jwt_token"); // Cookies to identify user.

    useEffect(() => {
      const fetchFriends = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3001/users/friendsList",
            {
              headers: {
                Authorization: "Bearer " + jwt_token,
              },
            }
          );
          console.log("Friends list fetching successful");
          console.log(response);
          setFriends(response.data); // Assuming the friend data is in the 'data' property of the response
        } catch (error) {
          console.error("Friends list fetching:", error);
        }
      };

      fetchFriends();
    }, []);

    return (
      <>
        <div>
          FRIENDS
          <ul>
            {friends.map((friend, index) => (
              <li key={index}>{friend}</li>
            ))}
          </ul>
        </div>
      </>
    );
  };

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
        <MatchStatsBox>
          <MatchMakingStats />
        </MatchStatsBox>
        <FriendsListBox>
          <FriendsList />
        </FriendsListBox>
      </RightSideGrid>
    </ContainerGrid>
  );
}
