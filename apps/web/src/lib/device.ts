const KEY = "upidown-device";

/** Random per-install id. Never tied to a person; the server only sees a daily-salted hash. */
export function deviceId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
