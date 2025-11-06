/* @refresh reload */
import { A, Route, Router } from "@solidjs/router";
import "solid-devtools";
import { Component } from "solid-js";
import { render } from "solid-js/web";
import App from "./App";
import "./index.css";
import { OpfsExplorer } from "./pages/opfs-explorer";
import { Workout } from "./pages/workout";
import { Workouts } from "./pages/workouts";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
    );
}

type LayoutProps = {
    children: Element
}

const Layout: Component<LayoutProps> = (props) => {
    return (
        <div class="min-h-screen flex flex-col bg-base-200">
            <div class="navbar bg-base-100 shadow-sm sticky top-0 z-10">
                <div class="navbar-start">
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

                    <A href="/" class="btn btn-ghost text-xl">
                        GymTracker
                    </A>
                </div>

                <div class="navbar-center hidden lg:flex">
                    <ul class="menu menu-horizontal px-1">
                        <li><A href="/">Home</A></li>
                        <li><A href="/workouts">Workouts</A></li>
                        <li><A href="/file-explorer">File Explorer</A></li>
                    </ul>
                </div>

                <div class="navbar-end">
                </div>
            </div>

            <main class="flex-1 p-4">{props.children}</main>
        </div>
    );
};

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
