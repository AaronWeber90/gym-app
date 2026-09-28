import { dataClient } from "@api";
import { useQuery, useQueryClient } from "@tanstack/solid-query";

export const bodyWeightQueryKey = ["body-weight"] as const;

export const createBodyWeightResource = () => {
	const queryClient = useQueryClient();
	const bodyWeightQuery = useQuery(() => ({
		queryKey: bodyWeightQueryKey,
		queryFn: () => dataClient.getBodyWeightEntries(),
		throwOnError: true,
	}));
	return {
		entries: () => bodyWeightQuery.data ?? [],
		error: () => bodyWeightQuery.error,
		isLoading: () => bodyWeightQuery.isLoading,
		refetch: () =>
			queryClient.invalidateQueries({ queryKey: bodyWeightQueryKey }),
	};
};
