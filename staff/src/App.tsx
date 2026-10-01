import Router from "src/Router";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import ThemeProvider from "src/ThemeProvider";
import Container from "@mui/material/Container";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContextProvider } from "src/ToastContext";
import Toasts from "src/components/Toasts";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Helmet>
          <title>BJJ Staff App</title>
        </Helmet>
        <ThemeProvider>
          <ToastContextProvider>
            <Container maxWidth="md">
              <Toasts />
              <Router />
            </Container>
          </ToastContextProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
