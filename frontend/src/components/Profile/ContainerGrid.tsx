import { Grid } from "@mui/material";

export function ContainerGrid({children}) {
  return (
    <div>
      <Grid
        container
        sx={{
          border: "1px solid black",
          borderRadius: "5px",
          height: "95vh",
          width: "95vw",
          margin: "10px",
          boxSizing: "border-box",
        }}
      >{children}</Grid>
    </div>
  );
}
