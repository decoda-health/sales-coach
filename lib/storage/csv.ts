import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

let writeLock = Promise.resolve();

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const release = writeLock;
  let resolve: () => void;
  writeLock = new Promise((r) => (resolve = r));
  await release;
  try {
    return await fn();
  } finally {
    resolve!();
  }
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

export async function readCsv<T extends Record<string, unknown>>(
  filename: string
): Promise<T[]> {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, "utf-8");
  if (!content.trim()) {
    return [];
  }
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    cast: (value, context) => {
      if (context.header) return value;
      // Keep ID fields as strings to ensure === comparisons work
      const column = context.column as string;
      if (column.includes("_id") || column.endsWith("_id")) {
        return value;
      }
      if (value === "true") return true;
      if (value === "false") return false;
      const num = Number(value);
      if (!isNaN(num) && value !== "") return num;
      return value;
    },
  }) as T[];
}

export async function writeCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[]
): Promise<void> {
  return withLock(async () => {
    ensureDataDir();
    const filePath = getFilePath(filename);
    if (rows.length === 0) {
      fs.writeFileSync(filePath, "");
      return;
    }
    const content = stringify(rows, { header: true });
    fs.writeFileSync(filePath, content);
  });
}

export async function appendRow<T extends Record<string, unknown>>(
  filename: string,
  row: T
): Promise<void> {
  return withLock(async () => {
    ensureDataDir();
    const filePath = getFilePath(filename);
    const existing = await readCsv<T>(filename);
    existing.push(row);
    const content = stringify(existing, { header: true });
    fs.writeFileSync(filePath, content);
  });
}

export async function upsertRow<T extends Record<string, unknown>>(
  filename: string,
  keyField: keyof T,
  row: T
): Promise<void> {
  return withLock(async () => {
    ensureDataDir();
    const existing = await readCsv<T>(filename);
    const idx = existing.findIndex((r) => r[keyField] === row[keyField]);
    if (idx >= 0) {
      existing[idx] = row;
    } else {
      existing.push(row);
    }
    const filePath = getFilePath(filename);
    const content = stringify(existing, { header: true });
    fs.writeFileSync(filePath, content);
  });
}

export async function upsertRowComposite<T extends Record<string, unknown>>(
  filename: string,
  keyFields: (keyof T)[],
  row: T
): Promise<void> {
  return withLock(async () => {
    ensureDataDir();
    const existing = await readCsv<T>(filename);
    const idx = existing.findIndex((r) =>
      keyFields.every((k) => r[k] === row[k])
    );
    if (idx >= 0) {
      existing[idx] = row;
    } else {
      existing.push(row);
    }
    const filePath = getFilePath(filename);
    const content = stringify(existing, { header: true });
    fs.writeFileSync(filePath, content);
  });
}

export function writeTranscript(callId: string, transcript: unknown): void {
  ensureDataDir();
  const transcriptsDir = path.join(DATA_DIR, "transcripts");
  if (!fs.existsSync(transcriptsDir)) {
    fs.mkdirSync(transcriptsDir, { recursive: true });
  }
  const filePath = path.join(transcriptsDir, `${callId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(transcript, null, 2));
}

export function readTranscript(callId: string): unknown | null {
  const filePath = path.join(DATA_DIR, "transcripts", `${callId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function getTranscriptPath(callId: string): string {
  return `data/transcripts/${callId}.json`;
}
