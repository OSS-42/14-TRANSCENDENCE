import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";
import { User } from "../../models/User";
import { MatchHistory } from "../Profile/MatchHistory";

type UserDetailsProps = {
  selectedUser: User;
  closeUserDetails: () => void;
};

function UserDetails({ selectedUser, closeUserDetails }: UserDetailsProps) {
  return (
    <Dialog open={Boolean(selectedUser)} onClose={closeUserDetails}>
      <DialogContent>
        <Box
          component="div"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
        >
          <Typography variant="h5" gutterBottom>
            User details
          </Typography>
          <img
            src={selectedUser?.avatar}
            alt={selectedUser?.username}
            width="250"
            height="250"
          />
          <Typography variant="h4">{selectedUser?.username}</Typography>
          <Box component="div" mt={2}>
            {/* Render the MatchHistory component here */}
            <MatchHistory user={selectedUser}></MatchHistory>
          </Box>
          <Box component="div" mt={2}>
            <Button variant="contained" onClick={closeUserDetails}>
              Invite to play
            </Button>
          </Box>
          <Box component="div" mt={2}>
            <Button variant="contained" onClick={closeUserDetails}>
              Fermer
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default UserDetails;
