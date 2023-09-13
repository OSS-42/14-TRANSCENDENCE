import { Grid } from "@mui/material";

export function RightSideGrid({children}) {
  return (
    <Grid
      item
      xs={12}
      sm={12}
      md={12}
      lg={8}
      sx={{
        border: "1px solid black",
        borderRadius: "5px",
        // margin: "20px"
      }}
    >{children}</Grid>
  );
}
