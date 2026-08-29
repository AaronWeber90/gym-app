import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@api": fileURLToPath(new URL("./src/api/index.ts", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		exclude: [...configDefaults.exclude, "e2e/**"],
	},
});
