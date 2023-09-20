import { Grid } from "@mui/material";

export function RightSideGrid({ children }) {
  return (
    <Grid
      item
      xs={6}
      sm={6}
      md={8}
      lg={9}
      xl={10}
      sx={{
        border: "1px solid #3d3242",
        borderWidth: "1px 1px 1px 0",
        borderRadius: "0 5px 5px 0",
        // margin: "20px"
      }}
    >
      {children}
    </Grid>
  );
}
