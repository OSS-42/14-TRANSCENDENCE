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
import { fetchMatchHistory, fetchUserMe } from "../api/requests";
import { matchRoutes } from "react-router-dom";

export function Profile() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username);
  const [match, setMatch] = useState({
    matchesWon: [],
    matchesLost: [],
  });

  const updateUsername = (newUsername) => {
    setUsername(newUsername);
  };

  async function getMatchHistory(){
    const matches = await fetchMatchHistory(user.id);
    setMatch(matches);
  }

  useEffect(() => {
    getMatchHistory();
  }, [user]);


  return (
    <ContainerGrid>
      <LeftSideGrid>
        <Name username={username} updateUsername={updateUsername} />
        <AvatarImage user={user} />
        {/* <ChangeAvatarButton setUser={setUser} /> */}
      </LeftSideGrid>
      <RightSideGrid>
        <MatchWonLost match={match}/>
        <MatchHistory match={match} />
        <FriendsList />
      </RightSideGrid>
    </ContainerGrid>
  );
}
