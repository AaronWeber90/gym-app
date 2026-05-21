import { createSignal } from "solid-js";
import { Button } from "./button";
import { TrashIcon } from "./icons/trash";

type ConfirmDeleteButtonProps = {
	ariaLabel: string;
	dialogTitle: string;
	dialogMessage: string;
	confirmLabel: string;
	onConfirm: () => void | Promise<void>;
};

export const ConfirmDeleteButton = (props: ConfirmDeleteButtonProps) => {
	const [showModal, setShowModal] = createSignal(false);
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const closeModal = () => {
		if (isSubmitting()) return;
		setShowModal(false);
	};

	const handleConfirm = async () => {
		setIsSubmitting(true);
		try {
			await props.onConfirm();
			setShowModal(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<Button
				variant="square-ghost"
				class="text-white"
				onClick={() => setShowModal(true)}
				aria-label={props.ariaLabel}
			>
				<TrashIcon />
			</Button>
			<dialog class="modal" open={showModal()}>
				<div class="modal-box">
					<h3 class="font-bold text-lg mb-2">{props.dialogTitle}</h3>
					<p class="text-sm text-base-content/70">{props.dialogMessage}</p>
					<div class="modal-action">
						<Button
							variant="ghost"
							onClick={closeModal}
							disabled={isSubmitting()}
						>
							Abbrechen
						</Button>
						<Button
							variant="primary"
							onClick={handleConfirm}
							disabled={isSubmitting()}
						>
							{isSubmitting() ? "Lösche…" : props.confirmLabel}
						</Button>
					</div>
				</div>
			</dialog>
		</>
	);
};
