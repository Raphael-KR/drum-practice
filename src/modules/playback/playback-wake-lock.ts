/** The browser owns permission and may release a screen lock at any time. */
export function createPlaybackWakeLock() {
  let playing = false;
  let disposed = false;
  let pending = false;
  let sentinel: WakeLockSentinel | undefined;
  const wanted = () => !disposed && playing && document.visibilityState === "visible";
  const release = () => {
    const previous = sentinel;
    sentinel = undefined;
    if (previous) void previous.release().catch(() => {});
  };
  async function sync() {
    if (!wanted()) {
      release();
      return;
    }
    if (sentinel || pending || !navigator.wakeLock) return;
    pending = true;
    try {
      const acquired = await navigator.wakeLock.request("screen");
      if (!wanted()) {
        await acquired.release();
        return;
      }
      if (!acquired.released) {
        sentinel = acquired;
        acquired.addEventListener("release", () => {
          if (sentinel === acquired) sentinel = undefined;
        }, { once: true });
      }
    } catch {
      // A browser denial or unsupported environment must not interrupt audio.
    } finally {
      pending = false;
    }
  }
  const visibilityChanged = () => { void sync(); };
  document.addEventListener("visibilitychange", visibilityChanged);
  return {
    setPlaying(value: boolean) {
      playing = value;
      void sync();
    },
    dispose() {
      disposed = true;
      document.removeEventListener("visibilitychange", visibilityChanged);
      release();
    },
  };
}
