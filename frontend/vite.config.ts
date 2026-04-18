import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite"
import path from "path";
import runableAnalyticsPlugin from "./vite/plugins/runable-analytics-plugin";

export default defineConfig({
	root: __dirname,
	cacheDir: path.resolve(__dirname, "node_modules/.vite"),
	plugins: [react(), runableAnalyticsPlugin(), tailwind()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		allowedHosts: true,
		hmr: { overlay: false, }
		,
		proxy: {
			"/api": {
				target: "http://127.0.0.1:5000",
				changeOrigin: true,
			},
			"/socket.io": {
				target: "ws://127.0.0.1:5000",
				ws: true,
			},
		},
	}
});
