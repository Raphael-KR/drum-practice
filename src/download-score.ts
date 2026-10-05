/** Browser transfer progress; null means the server did not provide a usable total. */
export function downloadScore(url: string, progress: (percent: number | null) => void): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url);
    request.responseType = "blob";
    request.timeout = 120_000;
    request.setRequestHeader("Cache-Control", "no-cache");
    progress(null);
    request.onprogress = event => progress(event.lengthComputable && event.total > 0
      ? Math.min(99, Math.floor(event.loaded / event.total * 100)) : null);
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`HTTP ${request.status}`));
        return;
      }
      progress(100);
      resolve(request.response);
    };
    request.onerror = () => reject(new Error("NetworkError: Connection or server access failed"));
    request.ontimeout = () => reject(new Error("TimeoutError: Download exceeded 120 seconds"));
    request.onabort = () => reject(new Error("AbortError: Download aborted"));
    request.send();
  });
}
