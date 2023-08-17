import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

const theme = createTheme({
  palette: {
		text: {
			primary: colors.eerieblack,
			// secondary: colors.accent,
			disabled: colors.silver,
		},
    error: {
      main: colors.bittersweet,
    },
    secondary: {
      main: colors.canary,
    },
    background: {
      default: colors.whiteSmoke,
      paper: colors.white,
    },
  },
});

export default theme;
