/* @refresh reload */
import { HashRouter, Route, useLocation, useNavigate } from "@solidjs/router";
import type { Component } from "solid-js";
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { Button } from "./ui/button";
import { FolderIcon } from "./ui/icons/folder";
import { SettingsIcon } from "./ui/icons/settings";

const root = document.getElementById("root");

if (!(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
	);
}

const Workout = lazy(() => import("./pages/workout"));
const Workouts = lazy(() => import("./pages/workouts"));
const OpfsExplorer = lazy(() => import("./pages/opfs-explorer"));

type LayoutProps = {
	children: Element;
};

const Layout: Component<LayoutProps> = (props) => {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<div class="min-h-screen flex flex-col bg-base-200">
			<main class="flex-1 p-4">{props.children}</main>
			<div class="dock">
				<Button
					variant={
						location.pathname.includes("/workouts") ? "dock-active" : "dock"
					}
					onClick={() => {
						navigate("/workouts");
					}}
				>
					<FolderIcon class="size-[1.2em]" />
					<span class="dock-label">Workouts</span>
				</Button>

				<Button
					onClick={() => {
						navigate("/file-explorer");
					}}
					variant={
						location.pathname.includes("/file-explorer")
							? "dock-active"
							: "dock"
					}
				>
					<SettingsIcon class="size-[1.2em]" />
					<span class="dock-label">OPFS</span>
				</Button>
			</div>
		</div>
	);
};

render(
	() => (
		<HashRouter root={Layout}>
			<Route path="/" component={Workouts} />
			<Route path="/workouts" component={Workouts} />
			<Route path="/workouts/:id" component={Workout} />
			<Route path="/file-explorer" component={OpfsExplorer} />
		</HashRouter>
	),
	root,
);
