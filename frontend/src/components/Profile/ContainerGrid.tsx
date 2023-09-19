import { Grid } from "@mui/material";

export function ContainerGrid({ children }) {
  return (
    <Grid
      container
      sx={{
        // border: '1px solid red',
        backgroundColor: "#090609",
        borderRadius: "5px",
        marginTop: "3rem",
        padding: "1rem",
        width: "90%",
        height: "auto",
        color: "#FFF",
      }}
    >
      {children}
    </Grid>
  );
}
