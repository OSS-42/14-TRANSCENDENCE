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
import { MatchHistory } from "../components/Profile/MatchHistory";

export function Profile() {
  const [user, setUser] = useState<User>();
//   const [selectedAvatar, setSelectedAvatar] = useState(null); // This set the selectedAvatar variable to null.

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

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <NameBox user={user?.username} />
        <AvatarBox user={user} />
		<ChangeAvatarBox setUser={setUser}/>
        <ChangeNameBox />
      </LeftSideGrid>
      <RightSideGrid>
        <AboutBox />
       <MatchHistoryBox>
          <MatchHistory user={user}/>
       </MatchHistoryBox>
        <FriendsListBox/>
      </RightSideGrid>
    </ContainerGrid>
  );
}
