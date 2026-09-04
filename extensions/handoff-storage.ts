import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, isAbsolute, join, resolve } from "node:path";

export interface HandoffStorageOptions {
	persistHandoff: boolean;
	handoffPath?: string;
	archiveHandoffs?: boolean;
}

export interface PersistedHandoff {
	persisted: boolean;
	handoffPath?: string;
	archivePath?: string;
}

export interface HandoffStorageIO {
	mkdir: typeof mkdir;
	readFile: typeof readFile;
	rename: typeof rename;
	writeFile: typeof writeFile;
	unlink: typeof unlink;
}

const realIO: HandoffStorageIO = { mkdir, readFile, rename, writeFile, unlink };

function uniqueName(prefix: string): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	return `${timestamp}-${prefix}-${randomUUID()}.md`;
}

async function atomicWrite(path: string, content: string, io: HandoffStorageIO): Promise<void> {
	const temporaryPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
	try {
		await io.writeFile(temporaryPath, content, "utf8");
		const rereadTemporary = await io.readFile(temporaryPath, "utf8");
		if (rereadTemporary !== content) throw new Error("temporary handoff content verification failed");
		await io.rename(temporaryPath, path);
		const reread = await io.readFile(path, "utf8");
		if (reread !== content) throw new Error("persisted handoff content verification failed");
	} catch (error) {
		try {
			await io.unlink(temporaryPath);
		} catch {
			// Best effort cleanup; preserve the original failure.
		}
		throw error;
	}
}

/** Persist exactly one canonical handoff, archiving every generated copy. */
export async function persistHandoff(
	cwd: string,
	content: string,
	options: HandoffStorageOptions,
	io: HandoffStorageIO = realIO,
): Promise<PersistedHandoff> {
	if (!options.persistHandoff) return { persisted: false };
	const handoffPath = isAbsolute(options.handoffPath ?? "")
		? options.handoffPath!
		: resolve(cwd, options.handoffPath ?? ".pi/handoff.md");
	const archiveDir = isAbsolute(options.handoffPath ?? "")
		? join(dirname(handoffPath), "handoffs")
		: resolve(cwd, ".pi/handoffs");

	await io.mkdir(dirname(handoffPath), { recursive: true });
	if (options.archiveHandoffs !== false) await io.mkdir(archiveDir, { recursive: true });

	let archivePath: string | undefined;
	if (options.archiveHandoffs !== false) {
		archivePath = join(archiveDir, uniqueName("handoff"));
		await atomicWrite(archivePath, content, io);
	}
	await atomicWrite(handoffPath, content, io);
	return { persisted: true, handoffPath, archivePath };
}

