/* @refresh reload */
import { Route, Router, useLocation, useNavigate } from "@solidjs/router";
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
const navigate = useNavigate();
  const location = useLocation();

    return (
        <div class="min-h-screen flex flex-col bg-base-200">
            {/* <div class="navbar bg-base-100 shadow-sm sticky top-0 z-10">
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
            </div> */}

            <main class="flex-1 p-4">{props.children}</main>
            <div class="dock">

  <button       onClick={() => {
        navigate("/");
      }} class={location.pathname === "/" ? "dock-active" : undefined}>
    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"><polyline points="1 11 12 2 23 11" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="2"></polyline><path d="m5,13v7c0,1.105.895,2,2,2h10c1.105,0,2-.895,2-2v-7" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></path><line x1="12" y1="22" x2="12" y2="18" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></line></g></svg>
    <span class="dock-label">Home</span>
  </button>
  
  <button class={location.pathname === "/workouts" ? "dock-active" : undefined} onClick={() => {
        navigate("/workouts");
      }}>
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
</svg>
    <span class="dock-label">Pläne</span>
  </button>
  
  <button onClick={() => {
        navigate("/file-explorer");
      }} class={location.pathname === "/file-explorer" ? "dock-active" : undefined}>
    <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" stroke-linejoin="miter" stroke-linecap="butt"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></circle><path d="m22,13.25v-2.5l-2.318-.966c-.167-.581-.395-1.135-.682-1.654l.954-2.318-1.768-1.768-2.318.954c-.518-.287-1.073-.515-1.654-.682l-.966-2.318h-2.5l-.966,2.318c-.581.167-1.135.395-1.654.682l-2.318-.954-1.768,1.768.954,2.318c-.287.518-.515,1.073-.682,1.654l-2.318.966v2.5l2.318.966c.167.581.395,1.135.682,1.654l-.954,2.318,1.768,1.768,2.318-.954c.518.287,1.073.515,1.654.682l.966,2.318h2.5l.966-2.318c.581-.167,1.135-.395,1.654-.682l2.318.954,1.768-1.768-.954-2.318c.287-.518.515-1.073.682-1.654l2.318-.966Z" fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></path></g></svg>
    <span class="dock-label">Files</span>
  </button>
</div>
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
