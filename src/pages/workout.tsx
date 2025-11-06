import { useParams } from "@solidjs/router";
import {createResource} from "solid-js";

export const Workout = () => {
    const params = useParams();

    const exercises = [
        {
            name: "Beinpresse",
            sets: [
                { set: 1, reps: 10, weight: 80 },
                { set: 2, reps: 8, weight: 90 },
                { set: 3, reps: 6, weight: 100 },
            ],
        },
        {
            name: "Bankdrücken",
            sets: [
                { set: 1, reps: 10, weight: 60 },
                { set: 2, reps: 8, weight: 70 },
            ],
        },
        {
            name: "Rücken",
            sets: [
                { set: 1, reps: 10, weight: 60 },
                { set: 2, reps: 8, weight: 70 },
            ],
        },
        {
            name: "Rücken2",
            sets: [
                { set: 1, reps: 10, weight: 60 },
                { set: 2, reps: 8, weight: 70 },
            ],
        },
        {
            name: "Beinstrecker",
            sets: [
                { set: 1, reps: 10, weight: 60 },
                { set: 2, reps: 8, weight: 70 },
            ],
        },
    ];

    return (
        <div class="overflow-x-auto w-full max-w-full">
            {/* Desktop Table */}
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
                {exercises.map((exercise) =>
                    exercise.sets.map((s) => (
                        <tr>
                            <td>{exercise.name}</td>
                            <td>{s.weight}</td>
                            <td>{s.reps}</td>
                            <td>{s.set}</td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            {/* Mobile Cards */}
            <div class="md:hidden space-y-4">
                {exercises.map((exercise) => (
                    <div class="card bg-base-200 shadow-sm">
                        <div class="card-body p-4">
                            <h3 class="font-bold text-lg mb-2">{exercise.name}</h3>
                            <div class="overflow-x-auto">
                                <table class="table table-xs">
                                    <thead>
                                    <tr>
                                        <th>Gewicht</th>
                                        <th>Whd.</th>
                                        <th>Sätze</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {exercise.sets.map((s) => (
                                        <tr>
                                            <td><input type="text" placeholder="Type here" class="input input-ghost " value={s.weight} />
                                            </td>
                                            <td><input type="text" placeholder="Type here" class="input input-ghost " value={s.reps} /></td>
                                            <td><input type="text" placeholder="Type here" class="input input-ghost " value={s.set} /></td>
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
    );
};
