import type { BodyWeightEntry } from "@api";
import { dataClient } from "@api";
import { createEffect, createSignal } from "solid-js";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { normalizeWeightInput } from "../../session/utils/normalize-weight-input";
import {
	combineDateAndTime,
	toDateInputValue,
	toTimeInputValue,
} from "../utils/date-time-input";

type WeightEntryModalProps = {
	open: boolean;
	entry: BodyWeightEntry | null;
	onClose: () => void;
	onSaved: () => void | Promise<void>;
};

const resolveFormDefaults = (entry: BodyWeightEntry | null) => {
	const reference = entry?.date ?? new Date().toISOString();
	return {
		weight: entry ? String(entry.weight).replace(".", ",") : "",
		date: toDateInputValue(reference),
		time: toTimeInputValue(reference),
	};
};

const persistEntry = async (
	entry: BodyWeightEntry | null,
	weight: number,
	isoDate: string,
) => {
	if (entry) {
		await dataClient.saveBodyWeightEntry({ ...entry, weight, date: isoDate });
	} else {
		await dataClient.createBodyWeightEntry({ weight, date: isoDate });
	}
};

type WeightEntryFieldsProps = {
	weight: string;
	date: string;
	time: string;
	onWeightInput: (value: string) => void;
	onDateInput: (value: string) => void;
	onTimeInput: (value: string) => void;
};

const WeightEntryFields = (props: WeightEntryFieldsProps) => (
	<>
		<Input
			type="text"
			inputMode="decimal"
			label="Gewicht (kg)"
			value={props.weight}
			onInput={(e) => props.onWeightInput(e.currentTarget.value)}
		/>
		<Input
			type="date"
			label="Datum"
			value={props.date}
			onInput={(e) => props.onDateInput(e.currentTarget.value)}
		/>
		<Input
			type="time"
			label="Uhrzeit"
			value={props.time}
			onInput={(e) => props.onTimeInput(e.currentTarget.value)}
		/>
	</>
);

export const WeightEntryModal = (props: WeightEntryModalProps) => {
	const [weight, setWeight] = createSignal("");
	const [date, setDate] = createSignal("");
	const [time, setTime] = createSignal("");

	// reset fields to the edited entry (or "now" for a new one) whenever the modal opens
	createEffect(() => {
		if (!props.open) {
			return;
		}
		const defaults = resolveFormDefaults(props.entry);
		setWeight(defaults.weight);
		setDate(defaults.date);
		setTime(defaults.time);
	});

	const handleSubmit = async () => {
		const parsedWeight = normalizeWeightInput(weight());
		if (!parsedWeight || parsedWeight <= 0 || !date() || !time()) {
			return;
		}

		try {
			await persistEntry(
				props.entry,
				parsedWeight,
				combineDateAndTime(date(), time()),
			);
			await props.onSaved();
		} catch (err) {
			console.error("Failed to save body weight entry:", err);
		}
	};

	return (
		<dialog class="modal" open={props.open}>
			<div class="modal-box">
				<h3 class="font-bold text-lg mb-4">
					{props.entry ? "Eintrag bearbeiten" : "Gewicht hinzufügen"}
				</h3>
				<form
					class="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
				>
					<WeightEntryFields
						weight={weight()}
						date={date()}
						time={time()}
						onWeightInput={setWeight}
						onDateInput={setDate}
						onTimeInput={setTime}
					/>
					<div class="modal-action">
						<Button variant="ghost" onClick={props.onClose}>
							Abbrechen
						</Button>
						<Button type="submit" variant="primary">
							Speichern
						</Button>
					</div>
				</form>
			</div>
		</dialog>
	);
};
