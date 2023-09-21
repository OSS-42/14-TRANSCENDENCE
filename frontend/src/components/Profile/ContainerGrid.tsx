import { Grid } from "@mui/material";
import { ReactNode } from "react";

export function ContainerGrid({ children }: { children: ReactNode }) {
  return (
    <Grid
      container
      sx={{
        // border: '1px solid red',
        backgroundColor: "#090609",
        borderRadius: "5px",
        marginTop: "3rem",
        padding: "1rem",
        width: "90%",
        height: "auto",
        color: "#FFF",
      }}
    >
      {children}
    </Grid>
  );
}
