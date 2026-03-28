import { execSync } from "node:child_process";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import solidPlugin from "vite-plugin-solid";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
	base: "/gym-app/",
	define: {
		__APP_VERSION__: JSON.stringify(commitHash),
	},
	plugins: [
		solidPlugin(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
		}),
	],
	server: {
		port: 3000,
	},
	build: {
		target: "esnext",
	},
});
