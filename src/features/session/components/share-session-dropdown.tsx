import type { ExerciseData, SessionData } from "@api";
import { createSignal } from "solid-js";
import { Dropdown } from "../../../ui/dropdown";
import { ShareIcon } from "../../../ui/icons/share";
import { formatSessionForAi } from "../utils";

const COPIED_FEEDBACK_MS = 1500;

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
		setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
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
