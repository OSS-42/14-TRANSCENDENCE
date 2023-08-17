import { NavBar } from "../components";
import { Box } from "@mui/system";
import { TextField } from "@mui/material";

export function Chat() {
  return (
    // main box
    <Box
      sx={{
        display: "flex flex-direction-row",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Box component={NavBar} />
      <Box
        sx={{
          display: "flex",
          padding: "10px",
          height: "96vh",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateRows: "11fr .5fr",
            width: "70%",
            padding: "2rem",
            border: "1px solid black",
            gap: "10px",
          }}
        >
          {/* Chat Box */}
          <Box
            sx={{
              border: "1px solid black",
              borderRadius: "4px",
              padding: "1rem",
            }}
          >
            I'm a chat room box for the messages received. Replace this line
            with a component.
          </Box>
          <TextField
            id="outlined-basic"
            label="Type your message..."
            variant="outlined"
          />
        </Box>
        {/* Lists Box */}
        <Box
          sx={{
            display: "grid",
            gridTemplateRows: "8fr 4fr",
            width: "30%",
            padding: "2rem",
            border: "1px solid black",
            gap: "10px",
          }}
        >
          <Box
            sx={{
              border: "1px solid black",
              borderRadius: "4px",
              padding: "1rem",
            }}
          >
            I'm a box for the friends list. Replace this line with a component.
          </Box>
          <Box
            sx={{
              border: "1px solid black",
              borderRadius: "4px",
              padding: "1rem",
            }}
          >
            I'm a box for the friends list. Replace this line with a component.
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
