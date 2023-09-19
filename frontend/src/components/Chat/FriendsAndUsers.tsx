import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { User } from '../../models/User'
import ChatBar from './ChatBar'
import ChatFriends from './ChatFriends'
import ReactModal from 'react-modal'
import UserDetails from './UserDetails'

import { fetchFriendsList, fetchUsersList } from '../../api/requests'
import { useRoutes } from '../../contexts/RoutesContext'
import { Box } from '@mui/material'


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
  const [gameId, setGameId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(10); 
  const [challengerUsername, setChallengerUsername] = useState<string | null>(null);
  const [challengerId, setChallengerId] = useState<number | null>(null);
  let interval: NodeJS.Timeout | null = null;
 
  

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
  

  useEffect(() => {
    socket.on('updateConnectedUsers', (updatedUsers: number[]) => {
      setConnectedUsers(updatedUsers)
    })
    socket.on('invitation', (payload: any) => {
      setGameId(payload.roomId);
      setChallengerUsername(payload.challengerUsername)
      setChallengerId(payload.challengerId)  
      setInvitationModalIsOpen(true);

      setTimeout(() => {
        setInvitationModalIsOpen(false);
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

  function acceptGame(){
    if (gameId) {
      setTimer(10);
      console.log("voici le challenger id", challengerId)
      socket.emit('challengeAccepted', {challengerId : challengerId, roomId: gameId });
      navigateTo(`game?${gameId}`);
    } else {
      console.error('gameId is not defined.'); 
    }
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setModalIsOpen(true)
  }

  // Fonction pour fermer les informations détaillées de l'utilisateur
  const closeUserDetails = () => {
    setModalIsOpen(false)
    setSelectedUser(null)
  }
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
         <Box
          component="div"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
            <p>You have been challenged by {challengerUsername}.</p>
            <p>Do you accept?</p>
            <p>Time left : {timer} seconds</p>
            <button onClick={acceptGame}>Fight</button>
            <button onClick={closeInvitationModal}>Decline</button>
        </Box>
      </ReactModal>
    </>
  )
}


