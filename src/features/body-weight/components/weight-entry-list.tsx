import type { BodyWeightEntry } from "@api";
import { For, Show } from "solid-js";
import { ConfirmDeleteButton } from "../../../ui/confirm-delete-button";
import { EmptyState } from "../../../ui/empty-state";
import { ListGroup } from "../../../ui/list-group";
import { formatDate } from "../../../utils/format-date";

type WeightEntryListProps = {
	entries: BodyWeightEntry[];
	onSelect: (entry: BodyWeightEntry) => void;
	onDelete: (entry: BodyWeightEntry) => void | Promise<void>;
};

export const WeightEntryList = (props: WeightEntryListProps) => (
	<Show
		when={props.entries.length > 0}
		fallback={<EmptyState message="Noch keine Einträge vorhanden" />}
	>
		<ListGroup>
			<For each={props.entries}>
				{(entry) => (
					<li class="flex items-center justify-between">
						<button
							type="button"
							class="flex items-center justify-between flex-1 p-3 hover:bg-base-200 transition text-left"
							onClick={() => props.onSelect(entry)}
						>
							<span class="font-medium">{entry.weight} kg</span>
							<span class="text-xs font-semibold opacity-60">
								{formatDate(entry.date, {
									day: "2-digit",
									month: "2-digit",
									year: "numeric",
								})}{" "}
								{formatDate(entry.date, {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						</button>
						<ConfirmDeleteButton
							ariaLabel="Eintrag löschen"
							dialogTitle="Eintrag löschen?"
							dialogMessage="Der Gewichtseintrag wird dauerhaft gelöscht."
							confirmLabel="Löschen"
							onConfirm={() => props.onDelete(entry)}
						/>
					</li>
				)}
			</For>
		</ListGroup>
	</Show>
);
