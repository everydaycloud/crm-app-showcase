import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    base: "/",
    server: {
        port: 3000,
        proxy: {
          "/v1": {
            target: "http://localhost:5050",
            changeOrigin: true,
            secure: false,
          },
        },
      },
});
