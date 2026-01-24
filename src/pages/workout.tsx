import { useParams } from "@solidjs/router";
import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { createWorkoutResource } from "../features/create-workout-resource";

export const Workout = () => {

        const { workouts } = createWorkoutResource();
    
    const params = useParams()
    const [showModal, setShowModal] = createSignal(false);
    const [workoutName, setWorkoutName] = createSignal("");
    const [newExercises, setNewExercises] = createSignal([{ name: "", sets: 1, reps: 10, weight: 0 }]);
    const [exercise, setExercise] = createSignal([]);

    const addExerciseInput = () => {
        setNewExercises([...newExercises(), { name: "", sets: 1, reps: 10, weight: 0 }]);
    };

    const removeExerciseInput = (index) => {
        setNewExercises(newExercises().filter((_, i) => i !== index));
    };

    const updateExerciseInput = (index, field, value) => {
        const updated = [...newExercises()];
        updated[index][field] = value;
        setNewExercises(updated);
    };

    const handleSaveWorkout = () => {
        if (!workoutName().trim()) {
            alert("Bitte gib einen Namen für das Training ein");
            return;
        }

        const validExercises = newExercises().filter(ex => ex.name.trim());
        if (validExercises.length === 0) {
            alert("Bitte füge mindestens eine Übung hinzu");
            return;
        }

        // Transform exercises to match the expected format
        const formattedExercises = validExercises.map(ex => ({
            name: ex.name,
            sets: Array.from({ length: ex.sets }, (_, i) => ({
                set: i + 1,
                reps: ex.reps,
                weight: ex.weight
            }))
        }));

        setExercise([...exercise(), ...formattedExercises]);
        
        // Reset modal state
        setShowModal(false);
        setWorkoutName("");
        setNewExercises([{ name: "", sets: 1, reps: 10, weight: 0 }]);
    };

    const handleCancelModal = () => {
        setShowModal(false);
        setWorkoutName("");
        setNewExercises([{ name: "", sets: 1, reps: 10, weight: 0 }]);
    };


const currentWorkout = createMemo(() => {
    const data = workouts();
    if (!data) return undefined;
    return data.find(workout => workout.id === params.id);
});


    return (
        <>
            <Show when={workouts()} fallback={<p>Loading...</p>}>

            <div class="overflow-x-auto w-full max-w-full">
                {/* Desktop Table */}
                                <h1 class="text-3xl font-bold">Workout {currentWorkout()?.name}</h1>



                <table class="hidden md:table table-sm table-pin-rows w-full">
                    <thead>
                        <tr>
                            <th>Übung</th>
                            <th>Satz</th>
                            <th>Wdh</th>
                            <th>Gewicht (kg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exercise().map((ex) =>
                            ex.sets.map((s) => (
                                <tr>
                                    <td>{ex.name}</td>
                                    <td>{s.set}</td>
                                    <td>{s.reps}</td>
                                    <td>{s.weight}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Mobile Cards */}
                <div class="md:hidden">
                                        <div class="fab fab-overwrite pb-4">
  <button class="btn btn-lg btn-circle btn-primary" onClick={() => setShowModal(true)}>+</button>
</div>
                    
                    <Switch>
                        <Match when={exercise().length < 1}>
                            <div class="text-center text-base-content/50 py-8">Keine Übungen vorhanden</div>
                        </Match>
                    </Switch>
                    {exercise().map((ex) => (
                        <div class="card bg-base-200 shadow-sm">
                            <div class="card-body p-4">
                                <h3 class="font-bold text-lg mb-2">{ex.name}</h3>
                                <div class="overflow-x-auto">
                                    <table class="table table-xs">
                                        <thead>
                                            <tr>
                                                <th>Satz</th>
                                                <th>Gewicht</th>
                                                <th>Whd.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ex.sets.map((s) => (
                                                <tr>
                                                    <td>{s.set}</td>
                                                    <td>
                                                        <input 
                                                            type="number" 
                                                            min="0" 
                                                            placeholder="Type here" 
                                                            class="input input-ghost input-xs w-20" 
                                                            value={s.weight} 
                                                        />
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="number" 
                                                            min="0" 
                                                            placeholder="Type here" 
                                                            class="input input-ghost input-xs w-20" 
                                                            value={s.reps} 
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </Show>

            <Show when={showModal()}>
                <dialog class="modal modal-open">
                    <div class="modal-box max-w-2xl">
                        <h3 class="font-bold text-lg mb-4">Neue Trainingseinheit</h3>
                        
                        <input
                            type="text"
                            placeholder="Name der Trainingseinheit"
                            class="input input-bordered w-full mb-4"
                            value={workoutName()}
                            onInput={(e) => setWorkoutName(e.target.value)}
                        />

                        <div class="divider">Übungen</div>

                        <div class="space-y-4 max-h-96 overflow-y-auto">
                            <For each={newExercises()}>
                                {(ex, index) => (
                                    <div class="card bg-base-200 p-4">
                                        <div class="flex justify-between items-start mb-2">
                                            <span class="font-semibold">Übung {index() + 1}</span>
                                            <Show when={newExercises().length > 1}>
                                                <button 
                                                    class="btn btn-ghost btn-xs btn-circle"
                                                    onClick={() => removeExerciseInput(index())}
                                                >
                                                    ✕
                                                </button>
                                            </Show>
                                        </div>
                                        
                                        <input
                                            type="text"
                                            placeholder="Übungsname"
                                            class="input input-bordered input-sm w-full mb-2"
                                            value={ex.name}
                                            onInput={(e) => updateExerciseInput(index(), 'name', e.target.value)}
                                        />
                                        
                                        <div class="grid grid-cols-3 gap-2">
                                            <div>
                                                <label class="label label-text text-xs">Sätze</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    class="input input-bordered input-sm w-full"
                                                    value={ex.sets}
                                                    onInput={(e) => updateExerciseInput(index(), 'sets', parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                            <div>
                                                <label class="label label-text text-xs">Wdh</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    class="input input-bordered input-sm w-full"
                                                    value={ex.reps}
                                                    onInput={(e) => updateExerciseInput(index(), 'reps', parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                            <div>
                                                <label class="label label-text text-xs">Gewicht (kg)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="2.5"
                                                    class="input input-bordered input-sm w-full"
                                                    value={ex.weight}
                                                    onInput={(e) => updateExerciseInput(index(), 'weight', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </For>
                        </div>

                        <button 
                            class="btn btn-outline btn-sm w-full mt-4"
                            onClick={addExerciseInput}
                        >
                            + Weitere Übung hinzufügen
                        </button>

                        <div class="modal-action">
                            <button class="btn btn-ghost" onClick={handleCancelModal}>
                                Abbrechen
                            </button>
                            <button class="btn btn-primary" onClick={handleSaveWorkout}>
                                Speichern
                            </button>
                        </div>
                    </div>
                </dialog>
            </Show>
        </>
    );
};