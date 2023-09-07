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
  const [match, setMatch] = useState({
    matchesWon: [],
    matchesLost: [],
  });

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

  useEffect(() => {
    if (user) {
      async function fetchMatch() {
        const jwt_token = Cookies.get("jwt_token");
        try {
          const response = await axios.get(
            `http://localhost:3001/users/matchHistory/${user.id}`,
            {
              headers: {
                Authorization: "Bearer " + jwt_token,
              },
            }
          );
          console.log("Match stats inside AboutBox fetching successful");
          setMatch(response.data);
        } catch (error) {
          console.error("Match stats fetching:", error);
        }
      }
      fetchMatch();
    }
  }, [user]); // No need to put match as a dependency here, because user class has a gamewon gamelost variable that will change

  console.log(match);

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <Name user={user?.username} setUser={setUser} />
        <AvatarImage user={user} />
        <ChangeAvatarButton setUser={setUser} />
      </LeftSideGrid>
      <RightSideGrid>
        <MatchWonLost match={match}/>
        <MatchHistory match={match} />
        <FriendsList />
      </RightSideGrid>
    </ContainerGrid>
  );
}
