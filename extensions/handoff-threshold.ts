export interface ContextUsageSnapshot {
	tokens: number | null | undefined;
	contextWindow: number | null | undefined;
}

export interface ThresholdState {
	crossed: boolean;
}

export function createThresholdState(): ThresholdState {
	return { crossed: false };
}

/** Use Pi's token count and active context window; never estimate from text size. */
export function contextUsageRatio(usage: ContextUsageSnapshot | null | undefined): number | null {
	if (!usage || typeof usage.tokens !== "number" || !Number.isFinite(usage.tokens)) return null;
	if (typeof usage.contextWindow !== "number" || !Number.isFinite(usage.contextWindow) || usage.contextWindow <= 0) {
		return null;
	}
	return usage.tokens / usage.contextWindow;
}

/** Returns true only on the first observation at or above the threshold. */
export function evaluateThreshold(
	state: ThresholdState,
	usage: ContextUsageSnapshot | null | undefined,
	threshold: number,
): boolean {
	if (state.crossed) return false;
	const ratio = contextUsageRatio(usage);
	if (ratio === null || !Number.isFinite(threshold) || threshold <= 0 || threshold >= 1 || ratio < threshold) {
		return false;
	}
	state.crossed = true;
	return true;
}

export function resetThreshold(state: ThresholdState): void {
	state.crossed = false;
}
