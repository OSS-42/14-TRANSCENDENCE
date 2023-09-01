import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { User } from "../models/User";
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

export function Profile() {
  const [user, setUser] = useState<User>();

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

  const handleNameEdit = async (editedUser) => {
    const jwt_token = Cookies.get("jwt_token");
    try {
      const response = await axios.post(
        "http://localhost:3001/users/me",
        editedUser,
        {
          headers: {
            Authorization: "Bearer " + jwt_token,
          },
        }
      );
      console.log("User data updated:", response.data);
      setUser(editedUser);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <NameBox user={user?.username} onEdit={handleNameEdit} />
        <AvatarBox user={user} />
        <ChangeAvatarBox setUser={setUser} />
        <ChangeNameBox />
      </LeftSideGrid>
      <RightSideGrid>
        <AboutBox />
        <MatchHistoryBox>
          <MatchHistoryBox user={user} />
        </MatchHistoryBox>
        <FriendsListBox />
      </RightSideGrid>
    </ContainerGrid>
  );
}
