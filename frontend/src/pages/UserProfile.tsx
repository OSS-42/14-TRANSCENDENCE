import { useEffect, useState } from "react";
import { ContainerGrid } from "../components/Profile/ContainerGrid";
import { RightSideGrid } from "../components/Profile/RightSideGrid";
import { LeftSideGrid } from "../components/Profile/LeftSideGrid";
import { MatchWonLost } from "../components/Profile/MatchWonLost";
import { MatchHistory } from "../components/Profile/MatchHistory";
import { useAuth } from "../contexts/AuthContext";
import { fetchMatchHistory, fetchUserInfo } from "../api/requests";
import { useParams } from "react-router-dom";
import { Avatar, Box } from "@mui/material";
import { useRoutes } from "../contexts/RoutesContext";
import { User } from "../models/User";

interface MatchData {
  date: string;
  winner: string;
  loser: string;
}
interface MatchHistoryData {
  matchesWon: MatchData[];
  matchesLost: MatchData[];
}

export function UserProfile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [match, setMatch] = useState<MatchHistoryData>({
    matchesWon: [],
    matchesLost: [],
  });
  const { navigateTo } = useRoutes();

  const params = useParams();

  useEffect(() => {
    async function fetchData() {
      if (!params || params.username === undefined) {
        return navigateTo("/error");
      }

      const username = params.username;

      if (username === user?.username) {
        return navigateTo("/profile");
      }

      try {
        const fetchedUser = await fetchUserInfo(username);
        if (fetchedUser) {
          setUserData(fetchedUser);
          const matches = await fetchMatchHistory(fetchedUser.id);
          setMatch(matches);
        } else {
          console.error("User data not found.");
          navigateTo("/error");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        navigateTo("/error");
      }
    }

    fetchData();
  }, [params, user, navigateTo]);

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <Box
          component="div"
          sx={{
            borderRadius: "5px",
            margin: "1rem 0 1rem 0",
            textAlign: "center",
            width: "100%",
            height: "5vh",
            padding: "10px",
            alignContent: "space-around",
            typography: { xs: "h5", sm: "h4" },
          }}
        >
          {userData?.username}
        </Box>
        <Box
          component="div"
          sx={{
            borderRadius: "5px",
            margin: "auto",
            width: "10rem",
            height: "10rem",
            display: "flex",
            overflow: "hidden",
          }}
        >
          <Avatar
            alt="Username"
            src={userData?.avatar}
            sx={{
              width: "100%", // Allow width to adjust
              height: "100%", // Fill the available height
              maxWidth: "100%",
              objectFit: "cover",
            }}
          />
        </Box>
      </LeftSideGrid>
      <RightSideGrid>
        <MatchWonLost match={match} />
        <MatchHistory match={match} />
      </RightSideGrid>
    </ContainerGrid>
  );
}
