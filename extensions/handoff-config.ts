import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface HandoffConfig {
	handoffThreshold: number;
	persistHandoff: boolean;
	handoffPath: string;
	archiveHandoffs: boolean;
}

export const DEFAULT_HANDOFF_CONFIG: HandoffConfig = {
	handoffThreshold: 0.70,
	persistHandoff: true,
	handoffPath: ".pi/handoff.md",
	archiveHandoffs: true,
};

export function loadHandoffConfig(cwd: string): HandoffConfig {
	const path = resolve(cwd, ".pi/handoff.json");
	if (!existsSync(path)) return { ...DEFAULT_HANDOFF_CONFIG };
	try {
		const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
		const config = { ...DEFAULT_HANDOFF_CONFIG };
		if (typeof raw.handoffThreshold === "number" && raw.handoffThreshold > 0 && raw.handoffThreshold < 1) {
			config.handoffThreshold = raw.handoffThreshold;
		}
		if (typeof raw.persistHandoff === "boolean") config.persistHandoff = raw.persistHandoff;
		if (typeof raw.handoffPath === "string" && raw.handoffPath.trim()) config.handoffPath = raw.handoffPath.trim();
		if (typeof raw.archiveHandoffs === "boolean") config.archiveHandoffs = raw.archiveHandoffs;
		return config;
	} catch {
		return { ...DEFAULT_HANDOFF_CONFIG };
	}
}
