import { Box } from "@mui/material";
import { User } from "../models/User";

export function NameBox() {
  return (
    <div>
      <Box
        sx={{
          border: "1px solid black",
          borderRadius: "5px",
          margin: "20px",
          fontWeight: "bold",
          fontSize: "20px",
          height: "5vh",
          padding: "20px", 
        }}
      >Name: </Box>
    </div>
  );
}
