import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "src/AuthContext";
import AccountMenu from "src/components/AccountMenu";
import TemporaryDrawer from "src/components/TemporaryDrawer";
const sxToolbar = {
  paddingLeft: "env(safe-area-inset-left)",
  paddingRight: "env(safe-area-inset-right)",
  paddingTop: "env(safe-area-inset-top)",
};
const TopBar = () => {
  const { authenticated } = useContext(AuthContext);
  return (
    <>
      <AppBar position="fixed">
        <Toolbar sx={sxToolbar}>
          {authenticated ? <TemporaryDrawer /> : null}
          <Box sx={{ flexGrow: 1 }}>
            <Button color="inherit" component={Link} to="/">
              Republic App
            </Button>
          </Box>
          {authenticated ? <AccountMenu /> : null}
        </Toolbar>
      </AppBar>
    </>
  );
};
export default TopBar;
