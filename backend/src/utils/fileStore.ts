import fs from "fs/promises";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || "./data";

export async function readJson<T>(filename: string): Promise<T[]> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as T[];
    } catch (e: any) {
      if (e.code === "ENOENT") {
        return [];
      }
      throw e;
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

export async function writeJson<T>(filename: string, data: T[]): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
