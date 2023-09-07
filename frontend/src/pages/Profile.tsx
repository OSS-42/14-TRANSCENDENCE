import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { User } from "../models/User";
import axios from "axios";
import { AvatarImage } from "../components/Profile/AvatarImage";
import { Name } from "../components/Profile/Name";
import { ContainerGrid } from "../components/Profile/ContainerGrid";
import { RightSideGrid } from "../components/Profile/RightSideGrid";
import { LeftSideGrid } from "../components/Profile/LeftSideGrid";
import { ChangeAvatarButton } from "../components/Profile/ChangeAvatarButton";
import { MatchWonLost } from "../components/Profile/MatchWonLost";
import { FriendsList } from "../components/Profile/FriendsLists";
import { MatchHistory } from "../components/Profile/MatchHistory";

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
        console.log("Here is the updated user: ", user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUsersData();
  }, []);

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <Name user={user?.username} setUser={setUser} />
        <AvatarImage user={user} />
        <ChangeAvatarButton setUser={setUser} />
      </LeftSideGrid>
      <RightSideGrid>
        <MatchWonLost user={user}/>
        <MatchHistory user={user} />
        <FriendsList />
      </RightSideGrid>
    </ContainerGrid>
  );
}
