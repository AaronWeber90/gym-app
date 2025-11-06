/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import "solid-devtools";
import { Route, Router, A } from "@solidjs/router";
import App from "./App";
import { Workouts } from "./pages/workouts";
import { Workout } from "./pages/workout";
import { OpfsExplorer } from "./pages/opfs-explorer";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
    );
}

// ✅ Layout component with DaisyUI navbar always visible
const Layout = (props) => {
    return (
        <div class="min-h-screen flex flex-col bg-base-200">
            {/* Navbar */}
            <div class="navbar bg-base-100 shadow-sm sticky top-0 z-10">
                <div class="navbar-start">
                    {/* Mobile dropdown */}
                    <div class="dropdown">
                        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 6h16M4 12h8m-8 6h16"
                                />
                            </svg>
                        </div>
                        <ul
                            tabindex="-1"
                            class="menu menu-xl dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                        >
                            <li><A href="/">Home</A></li>
                            <li><A href="/workouts">Workouts</A></li>
                            <li><A href="/file-explorer">File Explorer</A></li>
                        </ul>
                    </div>

                    {/* Brand */}
                    <A href="/" class="btn btn-ghost text-xl">
                        GymTracker
                    </A>
                </div>

                {/* Desktop menu */}
                <div class="navbar-center hidden lg:flex">
                    <ul class="menu menu-horizontal px-1">
                        <li><A href="/">Home</A></li>
                        <li><A href="/workouts">Workouts</A></li>
                        <li><A href="/file-explorer">File Explorer</A></li>
                    </ul>
                </div>

                {/* Navbar end */}
                <div class="navbar-end">
                </div>
            </div>

            {/* Main content */}
            <main class="flex-1 p-4">{props.children}</main>
        </div>
    );
};

// ✅ Router setup
render(
    () => (
        <Router root={Layout}>
            <Route path="/" component={App} />
            <Route path="/workouts" component={Workouts} />
            <Route path="/workouts/:id" component={Workout} />
            <Route path="/file-explorer" component={OpfsExplorer} />
        </Router>
    ),
    root
);
