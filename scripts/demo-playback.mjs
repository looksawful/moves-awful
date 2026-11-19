export function createDemoPlayback({ button, status, canvas, label, mount, motionQuery }) {
  if (!button || !status || !canvas || typeof mount !== "function") {
    throw new TypeError("Demo playback needs a button, status, canvas, and mount function.");
  }

  let disposed = false;
  let paused = false;
  let ready = false;
  let failed = false;
  let generation = 0;
  let release = () => {};

  const renderStatus = () => {
    if (disposed) return;
    const action = failed ? "Retry" : paused ? "Play" : "Pause";
    button.textContent = action;
    button.setAttribute("aria-label", `${action} ${label} animation`);
    button.hidden = Boolean(motionQuery?.matches) && !paused && !failed;

    if (failed) status.textContent = "Preview unavailable";
    else if (paused) status.textContent = "Paused";
    else if (!ready) status.textContent = "Loading preview";
    else if (motionQuery?.matches) status.textContent = "Static preview (reduced motion)";
    else status.textContent = "Playing";
  };

  const begin = () => {
    release();
    release = () => {};
    ready = false;
    failed = false;
    const token = ++generation;
    renderStatus();

    Promise.resolve()
      .then(() => {
        if (disposed || paused || token !== generation) return null;
        return mount();
      })
      .then((disposeMount) => {
        if (disposed || paused || token !== generation) {
          if (typeof disposeMount === "function") disposeMount();
          return;
        }
        if (typeof disposeMount !== "function") {
          failed = true;
          renderStatus();
          return;
        }

        release = disposeMount;
        ready = canvas.dataset.galleryState === "ready";
        failed = !ready;
        renderStatus();
      })
      .catch(() => {
        if (disposed || paused || token !== generation) return;
        failed = true;
        renderStatus();
      });
  };

  const onClick = () => {
    if (disposed) return;
    if (paused || failed) {
      paused = false;
      begin();
      return;
    }

    paused = true;
    generation += 1;
    release();
    release = () => {};
    renderStatus();
  };

  button.addEventListener("click", onClick);
  const motionChange = () => renderStatus();
  motionQuery?.addEventListener?.("change", motionChange);

  begin();

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      generation += 1;
      release();
      release = () => {};
      button.removeEventListener("click", onClick);
      motionQuery?.removeEventListener?.("change", motionChange);
    },
  };
}
