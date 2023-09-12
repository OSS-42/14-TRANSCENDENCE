import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "../../models/User";
import { Box } from "@mui/material";
import ChatBar from "./ChatBar";
import ChatFriends from "./ChatFriends";
import ReactModal from "react-modal";
import UserDetails from "./UserDetails";
import { fetchFriendsList, fetchUsersList } from "../../api/requests";

type someProp = {
  socket: Socket;
};

export function FriendsAndUsers({ socket }: someProp) {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [friendsList, setFriendsList] = useState<User[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    socket.on("updateConnectedUsers", (updatedUsers: number[]) => {
      setConnectedUsers(updatedUsers);
    });
  
    // Ajoutez cet écouteur pour gérer l'événement UpdateUserList
    socket.on("updateUserList", () => {
      fetchInitialData();
    });
  
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
      socket.off("UpdateUserList"); // Assurez-vous de supprimer l'écouteur lorsque le composant se démonte
    };
  }, []);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setModalIsOpen(true);
  };

  // Fonction pour fermer les informations détaillées de l'utilisateur
  const closeUserDetails = () => {
    setModalIsOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <ChatFriends
        socket={socket}
        friendsList={friendsList}
        setFriendsList={setFriendsList}
        connectedUsers={connectedUsers}
        handleUserClick={handleUserClick}
      />
      <Box mb={3} />
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
          />
        )}
      </ReactModal>
    </>
  );
}
