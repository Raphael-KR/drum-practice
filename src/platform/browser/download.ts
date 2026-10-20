/** One download lifecycle, including safe filenames and deferred object URL release. */
export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = name.replace(/[\\/:*?"<>|]/g, "_");
    a.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
