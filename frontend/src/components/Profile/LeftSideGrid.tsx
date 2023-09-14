import { Grid } from "@mui/material";

export function LeftSideGrid({children}){

	return (
    <Grid
      item
      xs={6}
      sm={6}
      md={6}
      lg={4}
      sx={{
        backgroundColor: '#090609',
        // border: '1px solid black',
        borderRadius: '5px',
        // margin: "20px",
				textAlign: 'center',
				alignContent: 'center',
      }}
    >
      {children}
    </Grid>
  )
}