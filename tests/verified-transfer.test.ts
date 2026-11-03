import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import test from "node:test";
import { verifiedTransfer } from "../src/core/verified-transfer";

const payload = Buffer.from("An exact retained source. ".repeat(256));
const identity = {
  bytes: payload.length,
  sha256: createHash("sha256").update(payload).digest("hex"),
};
async function server(mode: string) {
  const handles = new Set<ReturnType<typeof setTimeout>>();
  let closed = false;
  const later = (f: () => void, ms: number) => {
    const timer = setTimeout(f, ms);
    handles.add(timer);
  };
  const origin = createServer((_, response) => {
    response.on("close", () => {
      closed = true;
    });
    if (mode === "headers") {
      later(() => response.end(payload), 300);
      return;
    }
    if (mode === "http") {
      response.writeHead(503);
      response.end("maintenance");
      return;
    }
    response.writeHead(200, { "Content-Type": "image/jpeg" });
    if (mode === "wrong") {
      const copy = Buffer.from(payload);
      copy[0] = 0;
      response.end(copy);
      return;
    }
    if (mode === "oversize") {
      response.write(Buffer.alloc(payload.length + 1));
      return;
    }
    if (mode === "short") {
      response.end(payload.subarray(0, 2));
      return;
    }
    if (mode === "stall") {
      response.write(payload.subarray(0, 4));
      return;
    }
    let sent = 0;
    const send = () => {
      if (response.destroyed) return;
      const next = Math.min(payload.length, sent + 128);
      response.write(payload.subarray(sent, next));
      sent = next;
      if (sent === payload.length) response.end();
      else later(send, 15);
    };
    send();
  });
  await new Promise<void>((resolve) => origin.listen(0, "127.0.0.1", resolve));
  const address = origin.address();
  if (!address || typeof address === "string") throw new Error("No test origin");
  return {
    url: `http://127.0.0.1:${address.port}/source.jpg`,
    closed: () => closed,
    async close() {
      for (const h of handles) clearTimeout(h);
      origin.closeAllConnections();
      await new Promise<void>((resolve) => origin.close(() => resolve()));
    },
  };
}

test("active native HTTP bodies can take longer than the inactivity window", async () => {
  const origin = await server("active");
  try {
    const progress: number[] = [],
      started = performance.now();
    const bytes = await verifiedTransfer(origin.url, identity, {
      inactivityMs: 250,
      deadlineMs: 5000,
      onProgress: (n) => progress.push(n),
    });
    assert.ok(performance.now() - started > 250);
    assert.deepEqual(Buffer.from(bytes), payload);
    assert.equal(progress.at(-1), payload.length);
  } finally {
    await origin.close();
  }
});
test("silent headers and stalled bodies are bounded independently of active transfers", async () => {
  for (const mode of ["headers", "stall"]) {
    const origin = await server(mode);
    try {
      await assert.rejects(
        verifiedTransfer(origin.url, identity, {
          inactivityMs: 60,
          deadlineMs: mode === "headers" ? 120 : 2000,
        }),
        mode === "headers" ? /total time limit/ : /stopped sending data/,
      );
    } finally {
      await origin.close();
    }
  }
});
test("the total deadline can stop an active stream and caller cancellation has its own result", async () => {
  const origin = await server("active");
  try {
    await assert.rejects(
      verifiedTransfer(origin.url, identity, { inactivityMs: 1000, deadlineMs: 45 }),
      /total time limit/,
    );
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30);
    try {
      await assert.rejects(
        verifiedTransfer(origin.url, identity, { signal: controller.signal }),
        /cancelled/,
      );
    } finally {
      clearTimeout(timer);
    }
  } finally {
    await origin.close();
  }
});
test("wrong, oversized, incomplete and unsuccessful bodies cannot become source data", async () => {
  for (const [mode, message] of [
    ["wrong", /different bytes/],
    ["oversize", /too many bytes/],
    ["short", /incomplete body/],
    ["http", /HTTP 503/],
  ] as const) {
    const origin = await server(mode);
    try {
      await assert.rejects(verifiedTransfer(origin.url, identity), message);
    } finally {
      await origin.close();
    }
  }
});
test("an already cancelled read and an invalid identity never start a valid transfer", async () => {
  const origin = await server("active");
  try {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
      verifiedTransfer(origin.url, identity, { signal: controller.signal }),
      /cancelled/,
    );
    await assert.rejects(
      verifiedTransfer(origin.url, { bytes: -1, sha256: identity.sha256 }),
      /valid edition identity/,
    );
  } finally {
    await origin.close();
  }
});
