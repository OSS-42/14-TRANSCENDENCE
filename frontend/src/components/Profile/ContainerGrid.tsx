import { Grid } from "@mui/material";

export function ContainerGrid({children}) {
  return (
      <Grid
        container
        sx={{
					// border: '1px solid red',
          backgroundColor:'#090609',
          borderRadius: "5px",
          minHeight: "auto",
          height: "94vh",
          width: "99vw",
          boxSizing: "border-box",
          padding: "20px"
        }}
      >{children}</Grid>
  );
}
