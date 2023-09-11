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
import { useAuth } from "../contexts/AuthContext";
import { fetchUserMe } from "../api/requests";

export function Profile() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username);
    // const [match, setMatch] = useState({
  //   matchesWon: [],
  //   matchesLost: [],
  // });

  const updateUsername = (newUsername) => {
    setUsername(newUsername);
  };

  // useEffect(() => {
  //   if (user) {
  //     async function fetchMatch() {
  //       const jwt_token = Cookies.get("jwt_token");
  //       try {
  //         const response = await axios.get(
  //           `http://localhost:3001/users/matchHistory/${user.id}`,
  //           {
  //             headers: {
  //               Authorization: "Bearer " + jwt_token,
  //             },
  //           }
  //         );
  //         console.log("Match stats fetching successful");
  //         setMatch(response.data);
  //       } catch (error) {
  //         console.error("Match stats fetching:", error);
  //       }
  //     }
  //     fetchMatch();
  //   }
  // }, [user]); // No need to put match as a dependency here, because user class has a gamewon gamelost variable that will change

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <Name username={username} updateUsername={updateUsername} />
        {/* <AvatarImage user={user} />
        <ChangeAvatarButton setUser={setUser} /> */}
      </LeftSideGrid>
      <RightSideGrid>
        {/* <MatchWonLost match={match}/>
        <MatchHistory match={match} />
        <FriendsList /> */}
      </RightSideGrid>
    </ContainerGrid>
  );
}
