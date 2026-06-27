/**
 * Typed Promise client around the dictionary worker. Multiplexes requests by
 * an incrementing message id so concurrent translates and hints stay sorted.
 */

import type { WorkerRequest, WorkerResponse } from "./types";

export interface TranslationOk {
  kind: "ok";
  outline: string;
  text: string;
}
export interface TranslationUndo {
  kind: "undo";
  outline: string;
}
export interface TranslationUnknown {
  kind: "unknown";
  outline: string;
}
export type TranslationResult = TranslationOk | TranslationUndo | TranslationUnknown;

export interface HintHit {
  kind: "hit";
  outline: string;
  consumed: number;
}
export interface HintUndo {
  kind: "undo";
}
export interface HintNone {
  kind: "none";
}
export type HintLookup = HintHit | HintUndo | HintNone;

type Pending = {
  resolve: (value: WorkerResponse) => void;
  reject: (err: Error) => void;
};

type RequestPayload =
  | { kind: "load"; theoryId: string }
  | { kind: "translate"; outline: string }
  | { kind: "hint"; targetSuffix: string };

export class DictionaryWorkerClient {
  private worker: Worker | null = null;
  private nextId = 1;
  private pending = new Map<number, Pending>();

  private ensure(): Worker {
    if (this.worker) return this.worker;
    // Webpack resolves this URL at build time when bundled by Next.js.
    const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    w.addEventListener("message", (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      const handler = this.pending.get(msg.id);
      if (!handler) return;
      this.pending.delete(msg.id);
      handler.resolve(msg);
    });
    w.addEventListener("error", (e) => {
      const error = new Error(e.message || "worker error");
      for (const handler of this.pending.values()) handler.reject(error);
      this.pending.clear();
    });
    this.worker = w;
    return w;
  }

  private send(payload: RequestPayload): Promise<WorkerResponse> {
    const id = this.nextId++;
    const worker = this.ensure();
    return new Promise<WorkerResponse>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      worker.postMessage({ ...payload, id } as WorkerRequest);
    });
  }

  async load(theoryId: string): Promise<{ entries: number }> {
    const res = await this.send({ kind: "load", theoryId });
    if (res.kind === "ready") return { entries: res.entries };
    if (res.kind === "error") throw new Error(res.message);
    throw new Error(`unexpected response: ${res.kind}`);
  }

  async translate(outline: string): Promise<TranslationResult> {
    const res = await this.send({ kind: "translate", outline });
    if (res.kind === "translation") {
      if ("undo" in res && res.undo) return { kind: "undo", outline: res.outline };
      if ("unknown" in res && res.unknown) return { kind: "unknown", outline: res.outline };
      if ("text" in res) return { kind: "ok", outline: res.outline, text: res.text };
    }
    if (res.kind === "error") throw new Error(res.message);
    throw new Error(`unexpected response: ${res.kind}`);
  }

  async hint(targetSuffix: string): Promise<HintLookup> {
    const res = await this.send({ kind: "hint", targetSuffix });
    if (res.kind === "hint") {
      if ("undo" in res && res.undo) return { kind: "undo" };
      if ("none" in res && res.none) return { kind: "none" };
      if ("outline" in res && "consumed" in res) {
        return { kind: "hit", outline: res.outline, consumed: res.consumed };
      }
    }
    if (res.kind === "error") throw new Error(res.message);
    throw new Error(`unexpected response: ${res.kind}`);
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pending.clear();
  }
}
