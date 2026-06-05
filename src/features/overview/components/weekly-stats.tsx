import type { WeeklyInsights } from "../utils/calculate-overview-insights";

type Props = {
	insights: WeeklyInsights;
};

export const WeeklyStats = (props: Props) => {
	const formattedVolume = () =>
		new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(
			props.insights.totalVolume,
		);

	const formattedAverageSets = () =>
		new Intl.NumberFormat("de-DE", {
			maximumFractionDigits: 1,
			minimumFractionDigits: 1,
		}).format(props.insights.averageSetsPerSession);

	return (
		<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
			<div class="bg-base-200 rounded-lg p-3">
				<div class="text-xs text-base-content/60 font-medium">Diese Woche</div>
				<div class="text-2xl font-bold text-primary">
					{props.insights.totalSessions}
				</div>
				<div class="text-xs text-base-content/50">Trainings</div>
			</div>
			<div class="bg-base-200 rounded-lg p-3">
				<div class="text-xs text-base-content/60 font-medium">Aktive Tage</div>
				<div class="text-2xl font-bold text-secondary">
					{props.insights.activeDays}
				</div>
				<div class="text-xs text-base-content/50">von 7 Tagen</div>
			</div>
			<div class="bg-base-200 rounded-lg p-3">
				<div class="text-xs text-base-content/60 font-medium">Volumen</div>
				<div class="text-2xl font-bold text-accent">{formattedVolume()}</div>
				<div class="text-xs text-base-content/50">kg diese Woche</div>
			</div>
			<div class="bg-base-200 rounded-lg p-3">
				<div class="text-xs text-base-content/60 font-medium">Durchschnitt</div>
				<div class="text-2xl font-bold text-info">{formattedAverageSets()}</div>
				<div class="text-xs text-base-content/50">Sätze pro Training</div>
			</div>
		</div>
	);
};
