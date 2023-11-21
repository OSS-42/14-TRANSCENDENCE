import { Socket } from 'socket.io-client'
import { Box, Button } from '@mui/material'
import { User } from '../../models/User'
import { destroyFriend, fetchFriendsList } from '../../api/requests'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
// import SportsCricketSharpIcon from '@mui/icons-material/SportsCricketSharp' //UPDATE

type ChatFriendsProps = {
  socket: Socket
  connectedUsers: number[]
  connectedToPong: number[]
  friendsList: User[]
  setFriendsList: React.Dispatch<React.SetStateAction<User[]>>
  handleUserClick: (user: User) => void
}

//Allez chercher la liste des des utilisateurs connectedUsers a linititon du component.
//
const ChatFriends = ({
  setFriendsList,
  connectedUsers,
  handleUserClick,
  friendsList,
  connectedToPong,
}: ChatFriendsProps) => {
  async function removeFriend(id: number) {
    await destroyFriend(id)
    const newFriendList = await fetchFriendsList()
    setFriendsList(newFriendList)
  }

  return (
    <div className="chat__sidebar">
      <div>
        <h4 className="chat__header">FRIENDS LIST</h4>
        <div className="chat__users">
          <p></p>
          {friendsList.map((user) => (
            <Box
              component="div"
              key={user.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px',
                // border: '1px solid #ccc',
                borderRadius: '5px',
                marginBottom: '5px',
              }}
            >
              <img
                src={user.avatar}
                alt={user.username}
                width="50"
                height="50"
                style={{ borderRadius: '50%' }}
                onClick={() => handleUserClick(user)}
              />
              {/* ---------------- UPDATE ----------------- */}
              <div>
                <p> {user.username}</p>
                {connectedUsers?.includes(user.id) && (
                  <span style={{ color: '#65bf76' }}>online</span>
                )}
                {connectedToPong?.includes(user.id) && (
                  <span style={{ color: '#65bf76' }}> and not ready to play</span>
                )}
                {/* <Box
                  component="div"
                  sx={{ fontSize: 'small' }}
                >
                  <SportsCricketSharpIcon
                    style={{ color: userAvailability?.[user.id] ? 'green' : 'red' }}
                  />
                </Box> */}
              {/* ----------------------------------------- */}
              </div>
              <Button
                sx={{
                  minWidth: '.1',
                  padding: '.2rem .2rem .2rem 1rem',
                }}
                variant="contained"
                color="error"
                startIcon={<PersonRemoveIcon />}
                onClick={() => removeFriend(user.id)}
              />
            </Box>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChatFriends
