import { BodyWeightChart } from "../features/body-weight/components/body-weight-chart";
import { WeightEntryList } from "../features/body-weight/components/weight-entry-list";
import { WeightEntryModal } from "../features/body-weight/components/weight-entry-modal";
import { createBodyWeightPageState } from "../features/body-weight/hooks/create-body-weight-page-state";
import { Header } from "../features/workouts/components/header";
import { Section } from "../ui/section";

export default function BodyWeight() {
	const {
		entries,
		formTarget,
		openCreateForm,
		openEditForm,
		closeForm,
		handleSaved,
		handleDelete,
	} = createBodyWeightPageState();

	const editingEntry = () => {
		const target = formTarget();
		return target === "new" || target === "closed" ? null : target;
	};

	return (
		<div class="flex flex-col gap-4">
			<Header title="Körpergewicht" />

			<Section title="Verlauf">
				<BodyWeightChart entries={entries()} />
			</Section>

			<Section title="Einträge">
				<WeightEntryList
					entries={entries().toReversed()}
					onSelect={openEditForm}
					onDelete={handleDelete}
				/>
			</Section>

			<WeightEntryModal
				open={formTarget() !== "closed"}
				entry={editingEntry()}
				onClose={closeForm}
				onSaved={handleSaved}
			/>

			<div class="fab fab-overwrite pb-4">
				<button
					class="btn btn-lg btn-circle btn-primary"
					onClick={openCreateForm}
					aria-label="Gewicht hinzufügen"
					type="button"
				>
					+
				</button>
			</div>
		</div>
	);
}
