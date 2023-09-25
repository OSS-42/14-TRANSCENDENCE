// import Cookies from "js-cookie";
// import axios from "axios";
import { useEffect, useState } from "react";
// import { User } from "../models/User";
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
import { TwoFactorAuthentication } from "../components/Profile/TwoFactorAuthentication";

interface MatchData {
  date: string;
  winner: string;
  loser: string;
}
interface MatchHistoryData {
  matchesWon: MatchData[];
  matchesLost: MatchData[];
}

export function MyProfile() {
  const { user, setUser } = useAuth();
  const [match, setMatch] = useState<MatchHistoryData>({
    matchesWon: [],
    matchesLost: [],
  });

  const updateUsername = (newUsername: string) => {
    if (user) setUser({ ...user, username: newUsername });
  };

  async function getMatchHistory() {
    const matches = await fetchMatchHistory(user?.id ?? -1);
    setMatch(matches);
  }

  useEffect(() => {
    getMatchHistory();
  }, [user]);

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <Name user={user} handleUpdateUserName={updateUsername} />
        <AvatarImage user={user} />
        <ChangeAvatarButton updateUserData={setUser} />
        <TwoFactorAuthentication
          TwoFactorStatus={user?.is2FA ? true : false}
        />
      </LeftSideGrid>
      <RightSideGrid>
        <MatchWonLost match={match} />
        <MatchHistory match={match} />
        <FriendsList />
      </RightSideGrid>
    </ContainerGrid>
  );
}
