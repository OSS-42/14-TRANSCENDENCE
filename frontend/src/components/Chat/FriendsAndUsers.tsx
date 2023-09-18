import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { User } from '../../models/User'
import ChatBar from './ChatBar'
import ChatFriends from './ChatFriends'
import ReactModal from 'react-modal'
import UserDetails from './UserDetails'
import { fetchFriendsList, fetchUsersList } from '../../api/requests'
import { useRoutes } from '../../contexts/RoutesContext'


type someProp = {
  socket: Socket
}

export function FriendsAndUsers({ socket }: someProp) {
  const [usersList, setUsersList] = useState<User[]>([])
  const [friendsList, setFriendsList] = useState<User[]>([])
  const [connectedUsers, setConnectedUsers] = useState<number[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [invitationModalIsOpen, setInvitationModalIsOpen] = useState(false);

  const { navigateTo } = useRoutes();
  let gameId :string;

  function acceptGame(){
    navigateTo(`game?${gameId}`);
  }

  useEffect(() => {
    socket.on('updateConnectedUsers', (updatedUsers: number[]) => {
      setConnectedUsers(updatedUsers)
    })
    socket.on('invitation', (roomId: string) => {
      setInvitationModalIsOpen(true);
      console.log(roomId);
      navigateTo(`game?${gameId}`);

      setTimeout(() => {
        setInvitationModalIsOpen(false);
        gameId = roomId;
        //navigateTo(`game?${roomId}`);
      }, 10000);
      
    })

    async function fetchInitialData() {
      try {
        const newFriendsList = await fetchFriendsList()
        setFriendsList(newFriendsList)
        const newUsersList = await fetchUsersList()
        setUsersList(newUsersList)
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error)
      }
    }
    fetchInitialData()

    return () => {
      socket.off('updateConnectedUsers')
      socket.off('invitation')
    }
  }, [])

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setModalIsOpen(true)
  }

  // Fonction pour fermer les informations détaillées de l'utilisateur
  const closeUserDetails = () => {
    setModalIsOpen(false)
    setSelectedUser(null)
  }

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
            socket={socket}
          />
        )}
      </ReactModal>
      <ReactModal
        ariaHideApp={false}
        isOpen={invitationModalIsOpen}
        contentLabel="Demande d'acceptation de partie"
      >
        <div>
            <p>Vous avez reçu une demande d'acceptation de partie.</p>
            <p>Acceptez-vous la partie ?</p>
            <button onClick={acceptGame}>Accepter</button>
        </div>
      </ReactModal>
    </>
  )
}
