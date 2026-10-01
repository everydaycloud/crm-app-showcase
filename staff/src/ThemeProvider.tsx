import { useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme } from "src/theme";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
interface IProps {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }: IProps) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(
    () => createTheme(prefersDarkMode ? "dark" : "light"),
    [prefersDarkMode],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
};
export default ThemeProvider;
