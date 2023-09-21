import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";
import { User } from "../../models/User";
import { useRoutes } from "../../contexts/RoutesContext";
import { Socket } from "socket.io-client";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
// import { MatchHistory } from "../Profile/MatchHistory";

type UserDetailsProps = {
  selectedUser: User;
  closeUserDetails: () => void;
  socket: Socket;
  connectedToPong : Number[]
};

function UserDetails({
  selectedUser,
  closeUserDetails,
  socket,
  connectedToPong
}: UserDetailsProps) {
  const { user } = useAuth();
  const { navigateTo } = useRoutes();
  const [waiting, setWaiting] = useState(false); // État pour gérer l'affichage du message "Waiting for player to respond"

  useEffect(() => {
    socket.on("challengeAccepted", (payload: any) => {
      setWaiting(false);
      console.log("this is my paylod", payload);
      closeUserDetails();
      navigateTo(`game?${payload.roomId}`);
    });

    return () => {
      socket.off("challengeAccepted");
    };
  }, []);

  function inviteToPlay(id: number) {
    const roomId = 771237812;

    // Émettre l'invitation et activer le message "Waiting for player to respond"
    socket.emit("invitation", {
      userId: id,
      roomId: roomId,
      challengerUsername: user?.username,
      challengerId: user?.id,
    });
    setWaiting(true);

    setTimeout(() => {
      setWaiting(false);
      closeUserDetails();
    }, 10000);
  }

  return (
    <Dialog open={Boolean(selectedUser)} onClose={closeUserDetails}>
      <DialogContent>
        {waiting ? (
          <Box
            component="div"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h4">
              Waiting for {selectedUser?.username} to respond...
            </Typography>
          </Box>
        ) : (
          <Box
            component="div"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h5" color="#090609" gutterBottom>
              User Details
            </Typography>
            <img
              className="round-img"
              src={selectedUser?.avatar}
              alt={selectedUser?.username}
              width="250rem"
              height="250rem"
            />
            <Typography variant="h6">{selectedUser?.username}</Typography>
            <Box component="div" mt={2}>
              {/* Render the MatchHistory component here */}
              {/* <MatchHistory user={selectedUser}></MatchHistory> */}
            </Box>
            <Box component="div" mt={2}>
              <Button
                variant="contained"
                onClick={() => inviteToPlay(selectedUser?.id)}
                disabled={connectedToPong.includes(selectedUser?.id) || selectedUser?.id === user?.id}
              >
                Invite to play
              </Button>
            </Box>
            <Box component="div" mt={2}>
              <Button variant="contained" onClick={closeUserDetails}>
                Close
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UserDetails;
