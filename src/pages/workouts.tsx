import { For, Match, Show, Switch, createResource, createSignal } from "solid-js";
import { A } from "@solidjs/router";

// Reuse folder icon SVG from file explorer
const FolderIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="h-8 w-8 text-primary"
    >
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
        />
    </svg>
);

export const Workouts = () => {
    const fetchWorkouts = async () => {
        try {
            const root = await navigator.storage.getDirectory();
            const workoutsDir = await root.getDirectoryHandle("workouts", { create: true });
            const workouts = [];

            for await (const [name, handle] of workoutsDir.entries()) {
                if (handle.kind === "file" && name.endsWith(".json")) {
                    const file = await handle.getFile();
                    const text = await file.text();
                    const data = JSON.parse(text);
                    workouts.push({
                        id: data.id ?? name.replace(".json", ""),
                        name: data.name ?? "Unbenanntes Workout",
                        created_at: data.created_at ?? new Date().toISOString(),
                    });
                }
            }

            return workouts.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        } catch (err) {
            console.error("Failed to read workouts from OPFS:", err);
            return [];
        }
    };

    const [workouts, { refetch }] = createResource(fetchWorkouts);
    const [showModal, setShowModal] = createSignal(false);
    const [newWorkoutName, setNewWorkoutName] = createSignal("");

    const handleAddWorkout = async () => {
        const name = newWorkoutName().trim();
        if (!name) return;

        try {
            const root = await navigator.storage.getDirectory();
            const workoutsDir = await root.getDirectoryHandle("workouts", { create: true });
            const id = crypto.randomUUID();
            const handle = await workoutsDir.getFileHandle(`${id}.json`, { create: true });
            const writable = await handle.createWritable();

            const data = {
                id,
                name,
                created_at: new Date().toISOString(),
                exercises: [],
            };

            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();

            setShowModal(false);
            setNewWorkoutName("");
            await refetch();
        } catch (err) {
            console.error("Failed to add workout:", err);
        }
    };

    return (
        <>
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-3xl font-bold">Workouts</h1>
                <button class="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Workout
                </button>
            </div>

            <Show when={workouts.loading}>
                <p>Loading...</p>
            </Show>

            <Switch>
                <Match when={workouts.error}>
                    <span>Error: {workouts.error}</span>
                </Match>
                <Match when={workouts()}>
                    <ul class="list bg-base-100 rounded-box shadow-md divide-y divide-base-300">
                        <For each={workouts()}>
                            {(item) => (
                                <A href={`/workouts/${item.id}`}>
                                    <li class="flex items-center justify-between p-3 hover:bg-base-200 transition">
                                        <div class="flex items-center gap-3">
                                            <FolderIcon />
                                            <div>
                                                <div class="font-medium">{item.name}</div>
                                                <div class="text-xs uppercase font-semibold opacity-60">
                                                    {new Intl.DateTimeFormat("de-DE").format(
                                                        new Date(item.created_at)
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button class="btn btn-square btn-ghost">
                                            <svg
                                                class="size-[1.2em]"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                            >
                                                <g
                                                    stroke-linejoin="round"
                                                    stroke-linecap="round"
                                                    stroke-width="2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                >
                                                    <path d="M6 3L20 12 6 21 6 3z"></path>
                                                </g>
                                            </svg>
                                        </button>
                                    </li>
                                </A>
                            )}
                        </For>
                    </ul>
                </Match>
            </Switch>

            {/* DaisyUI Modal */}
            <Show when={showModal()}>
                <dialog class="modal modal-open">
                    <div class="modal-box">
                        <h3 class="font-bold text-lg mb-2">Add New Workout</h3>
                        <input
                            type="text"
                            placeholder="Workout name"
                            class="input input-bordered w-full mb-4"
                            value={newWorkoutName()}
                            onInput={(e) => setNewWorkoutName(e.currentTarget.value)}
                        />
                        <div class="modal-action">
                            <button class="btn btn-ghost" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button class="btn btn-primary" onClick={handleAddWorkout}>
                                Save
                            </button>
                        </div>
                    </div>
                </dialog>
            </Show>
        </>
    );
};
