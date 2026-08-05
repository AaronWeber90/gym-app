import { createSignal } from "solid-js";
import { Dropdown } from "../../../ui/dropdown";
import { ShareIcon } from "../../../ui/icons/share";
import {
	type ExerciseData,
	formatSessionForAi,
	type SessionData,
} from "../utils";

type ShareSessionDropdownProps = {
	session: Pick<SessionData, "name" | "date">;
	exercises: ExerciseData[];
};

export const ShareSessionDropdown = (props: ShareSessionDropdownProps) => {
	const [copied, setCopied] = createSignal(false);

	const handleCopyForAi = async () => {
		const formatted = formatSessionForAi(props.session, props.exercises);
		await navigator.clipboard.writeText(formatted);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<Dropdown
			triggerAriaLabel="Session teilen"
			triggerIcon={<ShareIcon />}
			triggerClass="text-white"
		>
			<li>
				<button type="button" onClick={handleCopyForAi}>
					{copied() ? "Kopiert!" : "Für KI kopieren"}
				</button>
			</li>
		</Dropdown>
	);
};
