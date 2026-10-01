import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "src/index.css";
import App from "src/App.tsx";
import { AuthContextProvider } from "src/AuthContext.tsx";
import * as Sentry from "@sentry/react";
import { browserTracingIntegration } from "@sentry/browser";
import Error from "src/pages/Error";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "https://0dddc3c8163ca3e08522eb3a4c69d6f2@o4510646851731456.ingest.de.sentry.io/4510646914973776",
    integrations: [browserTracingIntegration()],
    tracesSampleRate: 0.2,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthContextProvider>
      <Sentry.ErrorBoundary fallback={<Error />}>
        <App />
      </Sentry.ErrorBoundary>
    </AuthContextProvider>
  </StrictMode>,
);
