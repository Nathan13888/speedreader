/**
 * Tiny IndexedDB helper for caching the parsed forward map of a steno
 * dictionary. Sticks to the bare API to avoid adding a dependency.
 *
 * Schema: one object store (`dicts`) keyed by `<theoryId>:<version>`. Values
 * are plain `Record<outline, text>` objects.
 */

const DB_NAME = "speedreader_steno";
const DB_VERSION = 1;
const STORE = "dicts";

function isAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("idb open failed"));
  });
}

function cacheKey(theoryId: string, version: string): string {
  return `${theoryId}:${version}`;
}

export async function readCachedDict(
  theoryId: string,
  version: string,
): Promise<Record<string, string> | null> {
  if (!isAvailable()) return null;
  try {
    const db = await open();
    return await new Promise<Record<string, string> | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      const req = store.get(cacheKey(theoryId, version));
      req.onsuccess = () => {
        const value = req.result;
        resolve(value && typeof value === "object" ? (value as Record<string, string>) : null);
      };
      req.onerror = () => reject(req.error ?? new Error("idb get failed"));
    });
  } catch {
    return null;
  }
}

export async function writeCachedDict(
  theoryId: string,
  version: string,
  forwardMap: Record<string, string>,
): Promise<void> {
  if (!isAvailable()) return;
  try {
    const db = await open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const req = store.put(forwardMap, cacheKey(theoryId, version));
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error ?? new Error("idb put failed"));
    });
  } catch {
    // best-effort cache write
  }
}
