import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "bun:test";
import { createThresholdState, evaluateThreshold, resetThreshold } from "../extensions/handoff-threshold.ts";
import { persistHandoff, type HandoffStorageIO } from "../extensions/handoff-storage.ts";

const tempDirs: string[] = [];
function tempDir(): string {
	const path = join(process.cwd(), `.tmp-handoff-${Date.now()}-${Math.random().toString(36).slice(2)}`);
	mkdirSync(path, { recursive: true });
	tempDirs.push(path);
	return path;
}
afterEach(() => {
	for (const path of tempDirs.splice(0)) rmSync(path, { recursive: true, force: true });
});

describe("proactive handoff threshold", () => {
	it("does not trigger below 80% and triggers once at 80%", () => {
		const state = createThresholdState();
		expect(evaluateThreshold(state, { tokens: 799, contextWindow: 1000 }, 0.8)).toBe(false);
		expect(evaluateThreshold(state, { tokens: 800, contextWindow: 1000 }, 0.8)).toBe(true);
		expect(evaluateThreshold(state, { tokens: 900, contextWindow: 1000 }, 0.8)).toBe(false);
	});

	it("honors a configurable threshold and can reset", () => {
		const state = createThresholdState();
		expect(evaluateThreshold(state, { tokens: 750, contextWindow: 1000 }, 0.8)).toBe(false);
		expect(evaluateThreshold(state, { tokens: 800, contextWindow: 1000 }, 0.8)).toBe(true);
		resetThreshold(state);
		expect(evaluateThreshold(state, { tokens: 800, contextWindow: 1000 }, 0.8)).toBe(true);
	});
});

describe("durable handoff persistence", () => {
	it("writes the exact content and archives each generated handoff", async () => {
		const cwd = tempDir();
		const first = "## Goal\nFirst";
		const second = "## Goal\nSecond";
		await persistHandoff(cwd, first, { persistHandoff: true });
		await persistHandoff(cwd, second, { persistHandoff: true });
		expect(readFileSync(join(cwd, ".pi/handoff.md"), "utf8")).toBe(second);
		const archives = readdirSync(join(cwd, ".pi/handoffs")).filter((name) => name.endsWith(".md"));
		expect(archives).toHaveLength(2);
		expect(archives.map((name) => readFileSync(join(cwd, ".pi/handoffs", name), "utf8"))).toContain(first);
	});

	it("replaces atomically without leaving temporary files", async () => {
		const cwd = tempDir();
		await persistHandoff(cwd, "old", { persistHandoff: true });
		await persistHandoff(cwd, "new", { persistHandoff: true });
		expect(readFileSync(join(cwd, ".pi/handoff.md"), "utf8")).toBe("new");
		expect(readdirSync(join(cwd, ".pi")).some((name) => name.endsWith(".tmp"))).toBe(false);
	});

	it("surfaces directory and reread/verification failures", async () => {
		const cwd = tempDir();
		writeFileSync(join(cwd, ".pi"), "not a directory");
		await expect(persistHandoff(cwd, "content", { persistHandoff: true })).rejects.toThrow();

		const root = tempDir();
		const badReadIO: HandoffStorageIO = {
			mkdir: async (...args: any[]) => mkdirSync(args[0], { recursive: true }),
			writeFile: async (...args: any[]) => writeFileSync(args[0], args[1]),
			readFile: async () => "different",
			rename: async (...args: any[]) => rmSync(args[0], { force: true }) || writeFileSync(args[1], "different"),
			unlink: async (...args: any[]) => rmSync(args[0], { force: true }),
		};
		await expect(persistHandoff(root, "content", { persistHandoff: true }, badReadIO)).rejects.toThrow(/verification/);
	});
});
