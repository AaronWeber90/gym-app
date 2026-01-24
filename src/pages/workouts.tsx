import { A } from "@solidjs/router";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { createWorkoutResource } from "../features/create-workout-resource";

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

    const { workouts, refetch } = createWorkoutResource();
    const [showModal, setShowModal] = createSignal(false);
    const [newWorkoutName, setNewWorkoutName] = createSignal("");


    const cancelWorkoutCreation = () => {
        setNewWorkoutName("")
        setShowModal(false)
    }

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
            </div>

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
                    <div class="fab fab-overwrite pb-4">
  <button class="btn btn-lg btn-circle btn-primary" onClick={() => setShowModal(true)}>+</button>
</div>
                </Match>
            </Switch>



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
                            <button class="btn btn-ghost" onClick={cancelWorkoutCreation}>
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
