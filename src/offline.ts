/** The claim is backed by a complete byte audit, not worker control or key presence. */
interface EditionReply {
  type: "STOICHEIA_EDITION";
  protocol?: number;
  edition: string;
  complete: boolean;
  missing?: number;
  corrupt?: number;
  retired?: boolean;
  changed?: boolean;
  error?: string;
}
interface Progress {
  finished: number;
  total: number;
  loaded: number;
}
function ask(
  worker: ServiceWorker,
  repair: boolean,
  progress: (p: Progress) => void,
): Promise<EditionReply | null> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    let done = false,
      timeout: ReturnType<typeof setTimeout>;
    const finish = (reply: EditionReply | null) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      channel.port1.close();
      resolve(reply);
    };
    const arm = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => finish(null), 45000);
    };
    arm();
    channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      const data = event.data as Partial<EditionReply & Progress> | null;
      if (!data || typeof data !== "object") return;
      if ((data as { type?: string }).type === "STOICHEIA_PROGRESS") {
        arm();
        if (
          typeof data.finished === "number" &&
          typeof data.total === "number" &&
          typeof data.loaded === "number"
        )
          progress({ finished: data.finished, total: data.total, loaded: data.loaded });
        return;
      }
      if (
        data.type === "STOICHEIA_EDITION" &&
        typeof data.edition === "string" &&
        typeof data.complete === "boolean"
      )
        finish(data as EditionReply);
    };
    try {
      worker.postMessage(
        {
          type: repair ? "STOICHEIA_REPAIR_EDITION" : "STOICHEIA_INSPECT_EDITION",
          protocol: 2,
          edition: __STOICHEIA_EDITION__,
        },
        [channel.port2],
      );
    } catch {
      finish(null);
    }
  });
}

export function prepareOffline(status: HTMLElement, reload: HTMLButtonElement): void {
  if (import.meta.env.DEV) {
    status.textContent =
      "Development preview · offline saving is available in the production build.";
    reload.hidden = true;
    return;
  }
  if (!("serviceWorker" in navigator)) {
    status.textContent =
      "Offline saving is unavailable in this browser. You can save an illustrated reading.";
    reload.hidden = true;
    return;
  }
  const repair = document.createElement("button");
  repair.type = "button";
  repair.id = `${reload.id}-repair`;
  repair.className = "offline-repair";
  repair.textContent = "Check or repair offline files";
  repair.hidden = true;
  reload.insertAdjacentElement("afterend", repair);
  const container = navigator.serviceWorker;
  let registration: ServiceWorkerRegistration | undefined;
  let revision = 0,
    checking = false,
    repairing = false,
    installFailed = false,
    hadCurrent = false;
  let refreshAgain = false;
  const observed = new WeakSet<ServiceWorker>();
  const installPorts = new WeakMap<ServiceWorker, MessagePort>();
  function progress(p: Progress, operation: string) {
    status.textContent = `${operation}: ${p.finished} of ${p.total} files checked${p.loaded ? `; ${(p.loaded / 1048576).toFixed(1)} MiB received` : ""}. Keep this tab open.`;
  }
  function mismatch() {
    status.textContent = "A different edition is now saved offline. Reload to read that edition.";
    reload.hidden = false;
    repair.hidden = true;
  }
  function incomplete(reply?: EditionReply | null) {
    const counts =
      reply && (reply.missing || reply.corrupt)
        ? ` (${reply.missing ?? 0} missing, ${reply.corrupt ?? 0} damaged)`
        : "";
    status.textContent = reply?.error
      ? `Offline copy could not be repaired: ${reply.error}`
      : `Offline copy is incomplete${counts}. Check or repair it; your experiment stays open.`;
    reload.hidden = true;
    repair.hidden = false;
    repair.disabled = false;
  }
  function result(reply: EditionReply | null, worker: ServiceWorker) {
    if (worker !== container.controller) {
      void refresh();
      return;
    }
    if (reply?.edition !== __STOICHEIA_EDITION__) {
      if (reply?.complete || hadCurrent) mismatch();
      else {
        status.textContent =
          "This edition is not yet saved offline. Reconnect and check the saved files.";
        reload.hidden = true;
        repair.hidden = false;
      }
      return;
    }
    if (reply.changed) {
      status.textContent = "Saved files changed during checking. Checking the current copy…";
      setTimeout(() => void refresh(), 250);
      return;
    }
    if (reply.protocol === 2 && reply.complete && !reply.retired) {
      hadCurrent = true;
      installFailed = false;
      status.textContent = "Edition ready offline, including source pages";
      reload.hidden = true;
      repair.hidden = false;
      repair.disabled = false;
    } else incomplete(reply);
  }
  async function refresh() {
    if (repairing) return;
    if (checking) {
      refreshAgain = true;
      return;
    }
    const ticket = ++revision;
    const pendingWorker = registration?.installing ?? registration?.waiting;
    if (pendingWorker) {
      status.textContent = "Saving this edition for offline reading…";
      repair.hidden = true;
      reload.hidden = true;
      return;
    }
    const worker = container.controller;
    if (!worker) {
      status.textContent = installFailed
        ? "Offline saving paused. Check or repair to continue; verified files are kept."
        : "Saving this edition for offline reading…";
      repair.hidden = !installFailed;
      reload.hidden = true;
      if (registration?.active?.state === "activated")
        registration.active.postMessage({
          type: "STOICHEIA_CLAIM_EDITION",
          edition: __STOICHEIA_EDITION__,
        });
      return;
    }
    checking = true;
    repair.disabled = true;
    status.textContent = "Checking the saved edition’s files…";
    const reply = await ask(worker, false, (p) => {
      if (ticket === revision) progress(p, "Checking saved files");
    });
    checking = false;
    if (ticket === revision) result(reply, worker);
    if (refreshAgain) {
      refreshAgain = false;
      void refresh();
    }
  }
  function observe(worker: ServiceWorker | null) {
    if (!worker || observed.has(worker)) return;
    observed.add(worker);
    let activated = worker.state === "activated";
    if (worker.state === "installing") {
      const channel = new MessageChannel();
      installPorts.set(worker, channel.port1);
      channel.port1.onmessage = (event) => {
        if (worker !== registration?.installing || event.data?.edition !== __STOICHEIA_EDITION__)
          return;
        if (event.data.type === "STOICHEIA_PROGRESS")
          progress(event.data as Progress, "Saving offline files");
      };
      worker.postMessage({ type: "STOICHEIA_WATCH_INSTALL", edition: __STOICHEIA_EDITION__ }, [
        channel.port2,
      ]);
    }
    const changed = () => {
      if (worker.state === "activated") activated = true;
      if (worker.state === "redundant" && !activated) installFailed = true;
      if (["activated", "redundant"].includes(worker.state)) {
        installPorts.get(worker)?.close();
        installPorts.delete(worker);
      }
      void refresh();
    };
    worker.addEventListener("statechange", changed);
    changed();
  }
  async function register() {
    try {
      const next = await container.register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
        updateViaCache: "none",
      });
      if (registration !== next)
        next.addEventListener("updatefound", () => {
          installFailed = false;
          observe(next.installing);
        });
      registration = next;
      observe(next.installing);
      observe(next.waiting);
      observe(next.active);
      void refresh();
    } catch {
      installFailed = true;
      void refresh();
    }
  }
  repair.addEventListener("click", () => {
    if (repairing || checking) return;
    const worker = container.controller;
    if (!worker || installFailed || registration?.installing) {
      installFailed = false;
      repair.hidden = true;
      void register();
      return;
    }
    repairing = true;
    const ticket = ++revision;
    repair.disabled = true;
    reload.hidden = true;
    status.textContent = "Checking and repairing offline files… Keep this tab open.";
    void ask(worker, true, (p) => {
      if (ticket === revision) progress(p, "Repairing offline files");
    }).then((reply) => {
      repairing = false;
      if (ticket === revision) result(reply, worker);
      else void refresh();
    });
  });
  reload.addEventListener("click", () => location.reload());
  container.addEventListener("controllerchange", () => {
    revision++;
    void refresh();
  });
  container.addEventListener("message", (event) => {
    if (event.source !== container.controller) return;
    if (repairing && event.data?.type === "STOICHEIA_CACHE_DAMAGED") return;
    if (
      !["STOICHEIA_CACHE_CHANGED", "STOICHEIA_CACHE_DAMAGED", "STOICHEIA_CACHE_CHECKING"].includes(
        event.data?.type,
      )
    )
      return;
    if (event.data.edition !== __STOICHEIA_EDITION__) {
      revision++;
      mismatch();
      return;
    }
    if (event.data.type === "STOICHEIA_CACHE_DAMAGED") {
      revision++;
      status.textContent = "The saved edition needs repair. Checking its files…";
    } else if (event.data.type === "STOICHEIA_CACHE_CHECKING" && !repairing) {
      revision++;
      status.textContent = "Another tab is checking or repairing the saved edition…";
    }
    void refresh();
  });
  window.addEventListener("online", () => {
    if (registration?.active) void registration.update().catch(() => {});
    else void register();
    void refresh();
  });
  window.addEventListener("focus", () => void refresh());
  window.addEventListener("pageshow", () => void refresh());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void refresh();
  });
  void register();
}
