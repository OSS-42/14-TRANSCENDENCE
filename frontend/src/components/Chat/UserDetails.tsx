import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material'
import { User } from '../../models/User'
import { useRoutes } from '../../contexts/RoutesContext'
import { MatchHistory } from '../Profile/MatchHistory'
import { Socket } from 'socket.io-client'

type UserDetailsProps = {
  selectedUser: User
  closeUserDetails: () => void
  socket : Socket
}
 
  
function UserDetails({ selectedUser, closeUserDetails, socket }: UserDetailsProps) {
  const { navigateTo } = useRoutes();

  function inviteToPlay(id :number){
    const roomId = 771237812;
    socket.emit('invitation', { userId: id, roomId: roomId });
    
    navigateTo(`game?${roomId}`);
  }


  return (
    <Dialog open={Boolean(selectedUser)} onClose={closeUserDetails}>
      <DialogContent>
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
          {/* <a href="linktouserprofile"> */}
          <img
            className="round-img"
            src={selectedUser?.avatar}
            alt={selectedUser?.username}
            width="250rem"
            height="250rem"
          />
          {/* </a> */}
          <Typography variant="h6">{selectedUser?.username}</Typography>
          <Box component="div" mt={2}>
            {/* Render the MatchHistory component here */}
            {/* <MatchHistory user={selectedUser}></MatchHistory> */}
          </Box>
          <Box component="div" mt={2}>
          <Button variant="contained" onClick={() => inviteToPlay(selectedUser?.id)}>
              Invite to play
          </Button>
          </Box>
          <Box component="div" mt={2}>
            <Button variant="contained" onClick={closeUserDetails}>
              Close
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetails
