import { Grid } from "@mui/material";

export function LeftSideGrid({ children }) {
  return (
    <Grid
      item
      xs={6}
      sm={6}
      md={6}
      lg={4}
      sx={{
        border: "1px solid #3d3242",
        borderRadius: "5px",
        marginTop: "2rem",
        color: "#FFF",
      }}
    >
      {children}
    </Grid>
  );
}
