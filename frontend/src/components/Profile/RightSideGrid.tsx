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
        backgroundColor: '#090609',
				// border: '1px solid red',
        borderRadius: '5px',
        // margin: "20px"
      }}
    >
      {children}
    </Grid>
  )
}
