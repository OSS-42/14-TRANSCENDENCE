import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "../../models/User";
import ChatBar from "./ChatBar";
import ChatFriends from "./ChatFriends";
import ReactModal from "react-modal";
import UserDetails from "./UserDetails";
import { useAuth } from "../../contexts/AuthContext";
import { fetchFriendsList, fetchUsersList } from "../../api/requests";
import { useRoutes } from "../../contexts/RoutesContext";
import { Box, Button } from "@mui/material";
import { getCookies } from "../../utils";
interface UpdateConnectedUsersData {
  connectedUserIds: number[];
  connectedUserIdsPong: number[];
}

type someProp = {
  socket: Socket;
};

export function FriendsAndUsers({ socket }: someProp) {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [friendsList, setFriendsList] = useState<User[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<number[]>([]);
  const [connectedToPong, setConnectedToPong] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [invitationModalIsOpen, setInvitationModalIsOpen] = useState(false);
  const { navigateTo } = useRoutes();
  const [gameId, setGameId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(10);
  const [challengerUsername, setChallengerUsername] = useState<string | null>(
    null
  );
  const [challengerId, setChallengerId] = useState<number | null>(null);
  let interval: NodeJS.Timeout | null = null;
  const { logout, tkn } = useAuth();

  useEffect(() => {
    if (invitationModalIsOpen) {
      interval = setInterval(() => {
        setTimer((prevTimer: number) => prevTimer - 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
        setTimer(10);
      }
    };
  }, [invitationModalIsOpen]);
  
  // ----------------------------- DEBUT DU useEffect -----------------------------
  useEffect(() => {
    socket.on("updateConnectedUsers", (data: UpdateConnectedUsersData) => {
      const jwtToken:string  =  getCookies("jwt_token");
      if(tkn !== jwtToken ){
        logout() 
      }
      
      const { connectedUserIds, connectedUserIdsPong } = data;
      setConnectedUsers(connectedUserIds);

      setConnectedToPong(connectedUserIdsPong);
    });

    socket.on("invitation", (payload: any) => {
      setGameId(payload.roomId);
      setChallengerUsername(payload.challengerUsername);
      setChallengerId(payload.challengerId);
      setInvitationModalIsOpen(true);

      setTimeout(() => {
        setInvitationModalIsOpen(false);
      }, 10000);
    });

    // Je crois que c'est ici que ca ce passe pour les appel d'API en boucle
    async function fetchInitialData() {
      try {
        const newFriendsList = await fetchFriendsList();
        setFriendsList(newFriendsList);
        const newUsersList = await fetchUsersList();
        setUsersList(newUsersList);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    }
    fetchInitialData();

    return () => {
      socket.off("updateConnectedUsers");
      socket.off("invitation");
    };
  }, [connectedUsers]);
  // ----------------------------- FIN DU useEffect -----------------------------

  function acceptGame() {
    if (gameId) {
      setTimer(10);
      console.log("voici le challenger id", challengerId);
      socket.emit("challengeAccepted", {
        challengerId: challengerId,
        roomId: gameId,
      });
      navigateTo(`game?${gameId}`);
    } else {
      console.error("gameId is not defined.");
    }
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setModalIsOpen(true);
  };

  // Fonction pour fermer les informations détaillées de l'utilisateur
  const closeUserDetails = () => {
    setModalIsOpen(false);
    setSelectedUser(null);
  };
  function closeInvitationModal() {
    setInvitationModalIsOpen(false);
    setTimer(10);
  }

  return (
    <>
      <ChatFriends
        socket={socket}
        friendsList={friendsList}
        setFriendsList={setFriendsList}
        connectedUsers={connectedUsers}
        connectedToPong={connectedToPong}
        handleUserClick={handleUserClick}
      />
      <Box component="div" mb={3} />
      <ChatBar
        setUsersList={setUsersList}
        setFriendsList={setFriendsList}
        usersList={usersList}
        friendsList={friendsList}
        connectedUsers={connectedUsers}
        socket={socket}
        handleUserClick={handleUserClick}
      />

      {/* Modal pour afficher les informations détaillées de l'utilisateur */}
      <ReactModal
        ariaHideApp={false}
        isOpen={modalIsOpen}
        onRequestClose={closeUserDetails}
        contentLabel="Informations de l'utilisateur"
      >
        {selectedUser && (
          <UserDetails
            selectedUser={selectedUser}
            closeUserDetails={closeUserDetails}
            socket={socket}
            connectedToPong={connectedToPong}
          />
        )}
      </ReactModal>
      <ReactModal
        ariaHideApp={false}
        isOpen={invitationModalIsOpen}
        contentLabel="Demande d'acceptation de partie"
      >
        <Box
          component="div"
          display="flex"
          height="50vh"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          lineHeight="2rem"
        >
          <p>You have been challenged by {challengerUsername}.</p>
          <p>Do you accept?</p>
          <p>Time left : {timer} seconds</p> <br />
          <Button color="secondary" variant="contained" onClick={acceptGame}>
            Fight
          </Button>{" "}
          <br />
          <Button
            color="secondary"
            variant="contained"
            onClick={closeInvitationModal}
          >
            Decline
          </Button>
        </Box>
      </ReactModal>
    </>
  );
}
