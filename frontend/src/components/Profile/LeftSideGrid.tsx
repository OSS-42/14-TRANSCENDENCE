import { Grid } from "@mui/material";

export function LeftSideGrid({children}){

	return (
		<Grid
        item
        xs={4}
        sx={{
          border: "1px solid black",
          borderRadius: "5px",
          margin: "20px",
        }}
      >{children}</Grid>
	);
}