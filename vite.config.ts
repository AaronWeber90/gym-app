import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
	base: "/gym-app/",
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
