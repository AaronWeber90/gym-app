import type { BodyWeightEntry } from "@api";
import { dataClient } from "@api";
import { createSignal } from "solid-js";
import { createBodyWeightResource } from "./create-body-weight-resource";

// "new" opens the form for adding an entry, an entry object opens it for editing
type FormTarget = "closed" | "new" | BodyWeightEntry;

export const createBodyWeightPageState = () => {
	const { entries, isLoading, error, refetch } = createBodyWeightResource();
	const [formTarget, setFormTarget] = createSignal<FormTarget>("closed");

	const openCreateForm = () => setFormTarget("new");
	const openEditForm = (entry: BodyWeightEntry) => setFormTarget(entry);
	const closeForm = () => setFormTarget("closed");

	const handleSaved = async () => {
		closeForm();
		await refetch();
	};

	const handleDelete = async (entry: BodyWeightEntry) => {
		await dataClient.deleteBodyWeightEntry(entry.id);
		await refetch();
	};

	return {
		entries,
		isLoading,
		error,
		formTarget,
		openCreateForm,
		openEditForm,
		closeForm,
		handleSaved,
		handleDelete,
	};
};
