import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";
import { User } from "../../models/User";
import {colors} from "../../styles/colors"
import { MatchHistory } from "../Profile/MatchHistory";


type UserDetailsProps = {
    selectedUser: User | null;
    closeUserDetails: () => void;
  };

  function UserDetails({ selectedUser, closeUserDetails }: UserDetailsProps) {
    return (
      <Dialog open={Boolean(selectedUser)} onClose={closeUserDetails}>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="left">
            <Typography variant="h5" gutterBottom>
              Informations détaillées de l'utilisateur
            </Typography>
            <img
              src={selectedUser?.avatar}
              alt={selectedUser?.username}
              width="300"
              height="300"
            />
            <Typography variant="h4" style={{ color: colors.eerieblack }}>
              {selectedUser?.username}
            </Typography>
            <Typography variant="body1">
            <MatchHistory user={selectedUser}></MatchHistory>
            </Typography>
             <Box mt={2}>
                <Button variant="contained" onClick={closeUserDetails}>
                    Invite to play
                </Button>
            </Box>
            <Box mt={2}>
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