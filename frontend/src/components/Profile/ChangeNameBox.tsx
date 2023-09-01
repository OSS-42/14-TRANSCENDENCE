import { Box, Button } from "@mui/material";

function handleUsername() {
  console.log("Click Button");
}

export function ChangeNameBox() {
  return (
    <Box
	  component="div"
      sx={{
        border: "1px solid black",
        borderRadius: "5px",
        margin: "20px",
        width: "50%",
        display: "flex",
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
      }}
    >
      <input
        type="text" // Indicated that we will select a type file
        style={{ display: "none" }} // Hide the input element totally
        id="username-input" // Creates a specific id for the input
      />
      <label htmlFor="username-input">
        <Button
          variant="contained"
          size="large"
          component="span"
          onClick={handleUsername}
        >
          Change Username
        </Button>
      </label>
    </Box>
  );
}

//Code to put inside Profile if problem
{
  /* <Box
          sx={{
            border: "1px solid black",
            borderRadius: "5px",
            margin: "20px",
            width: "50%",
            display: "flex",
            justifyContent: "center", // Center horizontally
            alignItems: "center", // Center vertically
          }}
        >
          <input
            type="text" // Indicated that we will select a type file
            style={{ display: "none" }} // Hide the input element totally
            id="username-input" // Creates a specific id for the input
          />
          <label htmlFor="username-input">
            <Button variant="contained" size="large" component="span" onClick={handleUsername}>
              Change Username
            </Button>
          </label>
        </Box> */
}
