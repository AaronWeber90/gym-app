/* @refresh reload */

import {
	HashRouter,
	Route,
	type RouteSectionProps,
	useLocation,
	useNavigate,
} from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import type { Component } from "solid-js";
import { ErrorBoundary, lazy, Show, Suspense } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { Button } from "./ui/button";
import { CalendarDays } from "./ui/icons/calender-days";
import { FolderIcon } from "./ui/icons/folder";
import { ScaleIcon } from "./ui/icons/scale";
import { SettingsIcon } from "./ui/icons/settings";

const root = document.getElementById("root");

if (!(root instanceof HTMLElement)) {
	throw new TypeError(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
	);
}

globalThis.addEventListener("vite:preloadError", (event) => {
	event.preventDefault();
	globalThis.location.reload();
});

const Workout = lazy(() =>
	import("./pages/workout").then((m) => ({ default: m.Workout })),
);
const WorkoutSession = lazy(() =>
	import("./pages/workout-session").then((m) => ({
		default: m.WorkoutSession,
	})),
);
const Workouts = lazy(() =>
	import("./pages/workouts").then((m) => ({ default: m.Workouts })),
);
const OpfsExplorer = lazy(() =>
	import("./pages/opfs-explorer").then((m) => ({ default: m.OpfsExplorer })),
);
const Overview = lazy(() =>
	import("./pages/overview").then((m) => ({ default: m.WorkoutCalendar })),
);
const Settings = lazy(() =>
	import("./pages/settings").then((m) => ({ default: m.Settings })),
);
const BodyWeight = lazy(() =>
	import("./pages/body-weight").then((m) => ({ default: m.BodyWeight })),
);

const IOS_DEVICE_PATTERN = /iPhone|iPad|iPod/i;
const MAC_PATTERN = /Macintosh/i;

const isAppleDevice = () =>
	IOS_DEVICE_PATTERN.test(navigator.userAgent) ||
	// iPad on iOS 13+ reports as "MacIntel" desktop Safari
	("maxTouchPoints" in navigator &&
		navigator.maxTouchPoints > 1 &&
		MAC_PATTERN.test(navigator.userAgent));

const Layout: Component<RouteSectionProps> = (props) => {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<div class="min-h-screen flex flex-col bg-base-200">
			<Show when={isAppleDevice()}>
				<div class="bg-warning text-warning-content text-center text-sm p-2">
					This app may not work correctly on Apple devices.
				</div>
			</Show>
			<main class="flex-1 p-4 pb-safe">
				<ErrorBoundary fallback={(err) => <span>Error: {err.message}</span>}>
					<Suspense>{props.children}</Suspense>
				</ErrorBoundary>
			</main>
			<div class="dock">
				<Button
					variant={
						location.pathname === "/" || location.pathname.includes("/workouts")
							? "dock-active"
							: "dock"
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
						navigate("/settings");
					}}
					variant={
						location.pathname.includes("/settings") ? "dock-active" : "dock"
					}
				>
					<SettingsIcon class="size-[1.2em]" />
					<span class="dock-label">Settings</span>
				</Button>
				<Button
					onClick={() => {
						navigate("/overview");
					}}
					variant={
						location.pathname.includes("/overview") ? "dock-active" : "dock"
					}
				>
					<CalendarDays class="size-[1.2em]" />
					<span class="dock-label">Overview</span>
				</Button>
				<Button
					onClick={() => {
						navigate("/body-weight");
					}}
					variant={
						location.pathname.includes("/body-weight") ? "dock-active" : "dock"
					}
				>
					<ScaleIcon class="size-[1.2em]" />
					<span class="dock-label">Körpergewicht</span>
				</Button>
			</div>
		</div>
	);
};

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Number.POSITIVE_INFINITY,
		},
	},
});

render(
	() => (
		<QueryClientProvider client={queryClient}>
			<HashRouter root={Layout}>
				<Route path="/" component={Workouts} />
				<Route path="/workouts" component={Workouts} />
				<Route path="/workouts/:id" component={Workout} />
				<Route path="/workouts/:id/:sessionId" component={WorkoutSession} />
				<Route path="/file-explorer" component={OpfsExplorer} />
				<Route path="/settings" component={Settings} />
				<Route path="/overview" component={Overview} />
				<Route path="/body-weight" component={BodyWeight} />
			</HashRouter>
		</QueryClientProvider>
	),
	root,
);
