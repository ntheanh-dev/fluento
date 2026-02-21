export async function enableMocks() {
  const isBrowser = typeof window !== "undefined";

  if (isBrowser) {
    const { worker } = await import("./browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}
