import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "../../models/User";
import ChatBar from "./ChatBar";
import ChatFriends from "./ChatFriends";
import ReactModal from 'react-modal';
import UserDetails from "./UserDetails";


type someProp = {
  socket: Socket;
};

export function FriendsAndUsers({ socket} :someProp) {
    const [usersList, setUsersList] = useState<User[]>([]);
    const [friendsList, setFriendsList] = useState<User[]>([]);
    const [connectedUsers, setConnectedUsers] = useState<number[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
   
    useEffect(() => {
      async function fetchUsersData() {
        socket.on('updateConnectedUsers', (updatedUsers: number[]) => {
          setConnectedUsers(updatedUsers);
          fetchUsersData()

        });
        
        const jwt_token = Cookies.get('jwt_token');
        try {
          const response = await axios.get('http://localhost:3001/users/friendsList', {
            headers: {
              Authorization: "Bearer " + jwt_token,
            },
          });
          setFriendsList(response.data)
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      try {
        const response = await axios.get('http://localhost:3001/users/allUsers', {
          headers: {
            Authorization: "Bearer " + jwt_token,
          },
        });
        setUsersList(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      }
      fetchUsersData();
      socket.emit("getConnectedUsers")
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
      <ChatBar 
      setUsersList={setUsersList}
      setFriendsList={setFriendsList} 
      usersList={usersList}
      friendsList={friendsList}
      connectedUsers={connectedUsers}
      socket={socket} 
      handleUserClick={handleUserClick}

      />
      <ChatFriends 
      socket={socket}
      friendsList={friendsList}
      connectedUsers={connectedUsers} 
      handleUserClick={handleUserClick}
      />


      {/* Modal pour afficher les informations détaillées de l'utilisateur */}
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={closeUserDetails}
        contentLabel="Informations de l'utilisateur"
      >
        {selectedUser && (
          <UserDetails 
           selectedUser={selectedUser}
           closeUserDetails= {closeUserDetails}
          />
  
        )}
      </ReactModal>
    </>
  );
}