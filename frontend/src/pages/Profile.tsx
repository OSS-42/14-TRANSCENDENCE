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
import { TwoFactorAuthentication } from "../components/Profile/TwoFactorAuthentication";

export function Profile() {
  const { user, setUser } = useAuth();
  const [match, setMatch] = useState({
    matchesWon: [],
    matchesLost: [],
  });

  async function getMatchHistory() {
    const matches = await fetchMatchHistory(user.id);
    setMatch(matches);
  }

  useEffect(() => {
    getMatchHistory();
  }, [user]);

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <Name user={user?.username} setUser={setUser} />
        <AvatarImage user={user} />
        <ChangeAvatarButton setUser={setUser} />
        <TwoFactorAuthentication TwoFactorStatus={user.twoFactorSecret ? true : false}/>
      </LeftSideGrid>
      <RightSideGrid>
        <MatchWonLost match={match} />
        <MatchHistory match={match} />
        <FriendsList />
      </RightSideGrid>
    </ContainerGrid>
  );
}
