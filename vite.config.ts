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
			includeAssets: ["favicon.png", "apple-touch-icon.png", "mask-icon.svg"],
			manifest: {
				name: "Local Gym App",
				short_name: "Gym",
				description:
					"Lokales Fitness-Tracking als installierbare Offline-Web-App (local-first).",
				lang: "de-DE",
				start_url: "/gym-app/",
				scope: "/gym-app/",
				display: "standalone",
				theme_color: "#ffffff",
				background_color: "#ffffff",
				icons: [
					{
						src: "icon-192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "icon-512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
		}),
	],
	server: {
		port: 3000,
	},
	build: {
		target: "esnext",
	},
});
