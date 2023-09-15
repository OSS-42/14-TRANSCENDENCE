import { Grid } from "@mui/material";

export function ContainerGrid({children}) {
  return (
      <Grid
        container
        sx={{
          border: "1px solid black",
          borderRadius: "5px",
          minHeight: "auto",
          height: "auto",
          width: "auto",
          boxSizing: "border-box",
          padding: "20px"
        }}
      >{children}</Grid>
  );
}
