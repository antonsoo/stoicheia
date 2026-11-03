/** Embedded with a CSP hash: this page must work when every saved app file is gone. */
export function offlineRecovery(edition: string, base: string): void {
  const status = document.getElementById("recovery-status");
  const button = document.getElementById("recovery-repair") as HTMLButtonElement | null;
  if (!status || !button) return;
  const address = document.getElementById("recovery-address");
  if (address) address.textContent = `${location.pathname}${location.hash}`;
  const context = document.getElementById("recovery-context");
  const p = new URLSearchParams(location.hash.slice(1)).get("p");
  if (
    context &&
    (location.pathname === base || location.pathname === `${base}index.html`) &&
    p &&
    /^(?:[1-9]|1[0-9]|2[0-3])$/.test(p)
  )
    context.textContent = `Euclid I.${p}. Your applied settings remain at this lesson’s address.`;
  let reload = false;
  button.addEventListener("click", () => {
    if (reload) {
      location.reload();
      return;
    }
    const worker = navigator.serviceWorker.controller;
    if (!worker) {
      status.textContent = "The saved reader is unavailable. Reconnect and reload this address.";
      return;
    }
    button.disabled = true;
    status.textContent = "Checking and repairing the saved reader… Keep this tab open.";
    const channel = new MessageChannel();
    let timeout: ReturnType<typeof setTimeout>;
    const finish = () => {
      clearTimeout(timeout);
      channel.port1.close();
      button.disabled = false;
    };
    const arm = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        finish();
        status.textContent = "The saved reader did not respond. Reconnect and try again.";
      }, 45000);
    };
    arm();
    channel.port1.onmessage = (event) => {
      const data = event.data;
      if (data?.type === "STOICHEIA_PROGRESS") {
        arm();
        status.textContent = `Repairing ${data.finished} of ${data.total} files; ${(data.loaded / 1048576).toFixed(1)} MiB received. Keep this tab open.`;
      } else if (data?.type === "STOICHEIA_EDITION") {
        finish();
        if (data.edition !== edition) {
          reload = true;
          button.textContent = "Reload the current edition";
          status.textContent = "A newer edition is available. Reload to continue at this address.";
        } else if (data.complete) {
          reload = true;
          button.textContent = "Return to this lesson";
          status.textContent = "The reader is repaired. Return to the same lesson and settings.";
        } else
          status.textContent = `The reader is still incomplete. ${typeof data.error === "string" ? data.error : "Reconnect and repair again."}`;
      }
    };
    try {
      worker.postMessage({ type: "STOICHEIA_REPAIR_EDITION", protocol: 2, edition }, [
        channel.port2,
      ]);
    } catch {
      finish();
      status.textContent = "The saved reader could not be contacted. Reconnect and reload.";
    }
  });
  const home = document.getElementById("recovery-home") as HTMLAnchorElement | null;
  if (home) home.href = base;
}
