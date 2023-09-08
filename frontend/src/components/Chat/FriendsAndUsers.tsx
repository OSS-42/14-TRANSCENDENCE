import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "../../models/User";
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
    async function fetchUsersData() {
      socket.on("updateConnectedUsers", (updatedUsers: number[]) => {
        setConnectedUsers(updatedUsers);
        fetchUsersData();
      });

      const newFriendsList = await fetchFriendsList();
      setFriendsList(newFriendsList);
      const newUsersList = await fetchUsersList();
      setUsersList(newUsersList);
    }
    fetchUsersData();
    socket.emit("getConnectedUsers");
    return () => {
      socket.off("updateConnectedUsers");
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
