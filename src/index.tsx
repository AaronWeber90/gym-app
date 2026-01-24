/* @refresh reload */
import { Route, Router, useLocation, useNavigate } from "@solidjs/router";
import "solid-devtools";
import type { Component } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { OpfsExplorer } from "./pages/opfs-explorer";
import { Workout } from "./pages/workout";
import { Workouts } from "./pages/workouts";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
	);
}

type LayoutProps = {
	children: Element;
};

const Layout: Component<LayoutProps> = (props) => {
	const navigate = useNavigate();
	const location = useLocation();

	console.log(location);

	return (
		<div class="min-h-screen flex flex-col bg-base-200">
			<main class="flex-1 p-4">{props.children}</main>
			<div class="dock">
				<button
					class={
						location.pathname.includes("/workouts") ? "dock-active" : undefined
					}
					onClick={() => {
						navigate("/workouts");
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
						/>
					</svg>
					<span class="dock-label">Pläne</span>
				</button>

				<button
					onClick={() => {
						navigate("/file-explorer");
					}}
					class={
						location.pathname.includes("/file-explorer")
							? "dock-active"
							: undefined
					}
				>
					<svg
						class="size-[1.2em]"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
					>
						<g
							fill="currentColor"
							stroke-linejoin="miter"
							stroke-linecap="butt"
						>
							<circle
								cx="12"
								cy="12"
								r="3"
								fill="none"
								stroke="currentColor"
								stroke-linecap="square"
								stroke-miterlimit="10"
								stroke-width="2"
							></circle>
							<path
								d="m22,13.25v-2.5l-2.318-.966c-.167-.581-.395-1.135-.682-1.654l.954-2.318-1.768-1.768-2.318.954c-.518-.287-1.073-.515-1.654-.682l-.966-2.318h-2.5l-.966,2.318c-.581.167-1.135.395-1.654.682l-2.318-.954-1.768,1.768.954,2.318c-.287.518-.515,1.073-.682,1.654l-2.318.966v2.5l2.318.966c.167.581.395,1.135.682,1.654l-.954,2.318,1.768,1.768,2.318-.954c.518.287,1.073.515,1.654.682l.966,2.318h2.5l.966-2.318c.581-.167,1.135-.395,1.654-.682l2.318.954,1.768-1.768-.954-2.318c.287-.518.515-1.073.682-1.654l2.318-.966Z"
								fill="none"
								stroke="currentColor"
								stroke-linecap="square"
								stroke-miterlimit="10"
								stroke-width="2"
							></path>
						</g>
					</svg>
					<span class="dock-label">Files</span>
				</button>
			</div>
		</div>
	);
};

render(
	() => (
		<Router root={Layout} base="/gym-app">
			<Route path="/" component={Workouts} />
			<Route path="/workouts" component={Workouts} />
			<Route path="/workouts/:id" component={Workout} />
			<Route path="/file-explorer" component={OpfsExplorer} />
		</Router>
	),
	root,
);
