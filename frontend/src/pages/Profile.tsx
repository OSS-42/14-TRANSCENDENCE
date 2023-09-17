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
import { fetchMatchHistory } from "../api/requests";

export function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(user);
  const [match, setMatch] = useState({
    matchesWon: [],
    matchesLost: [],
  });

  const updateUserData = (newUser) => {
    setUserData(newUser);
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
        <Name user={userData?.username} updateUserData={updateUserData} />
        <AvatarImage user={userData} />
        <ChangeAvatarButton setUser={setUserData} />
      </LeftSideGrid>
      <RightSideGrid>
        <MatchWonLost match={match}/>
        <MatchHistory match={match} />
        <FriendsList />
      </RightSideGrid>
    </ContainerGrid>
  );
}
