import { Grid } from "@mui/material";
import { ReactNode } from "react";

export function LeftSideGrid({ children }: { children: ReactNode }) {
  return (
    <Grid
      item
      xs={6}
      sm={6}
      md={4}
      lg={3}
      xl={2}
      sx={{
        border: "1px solid #3d3242",
        borderRight: "1px dashed #3d3242",
        borderRadius: "5px 0 0 5px",
        color: "#FFF",
      }}
    >
      {children}
    </Grid>
  );
}
