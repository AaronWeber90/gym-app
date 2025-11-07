
export const Workout = () => {


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

                            <button class="btn btn-primary" onClick={() => {}}>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
  <path fill-rule="evenodd" d="M3.75 3A1.75 1.75 0 0 0 2 4.75v10.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 18 15.25v-8.5A1.75 1.75 0 0 0 16.25 5h-4.836a.25.25 0 0 1-.177-.073L9.823 3.513A1.75 1.75 0 0 0 8.586 3H3.75ZM10 8a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5A.75.75 0 0 1 10 8Z" clip-rule="evenodd" />
</svg>

Neue Einheit

                </button>
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
                                            <td><input type="number"   min="0" placeholder="Type here" class="input input-ghost " value={s.weight} />
                                            </td>
                                            <td><input type="number"   min="0" placeholder="Type here" class="input input-ghost " value={s.reps} /></td>
                                            <td><input type="number"   min="0" placeholder="Type here" class="input input-ghost " value={s.set} /></td>
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
