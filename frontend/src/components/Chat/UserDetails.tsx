import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material'
import { User } from '../../models/User'
import { MatchHistory } from '../Profile/MatchHistory'

type UserDetailsProps = {
  selectedUser: User
  closeUserDetails: () => void
}

function UserDetails({ selectedUser, closeUserDetails }: UserDetailsProps) {
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
            <Button variant="contained" onClick={closeUserDetails}>
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
