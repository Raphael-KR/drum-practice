export function portableWorkerURL() {
  const source = document.getElementById("portable-worker");
  return source
    ? URL.createObjectURL(
        new Blob([JSON.parse(source.textContent!)], {
          type: "text/javascript",
        }),
      )
    : undefined;
}
