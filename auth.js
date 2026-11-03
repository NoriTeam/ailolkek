async function request(action, data = {}) {
  const r = await fetch("/api/auth/" + action, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await r.json();
  if (!r.ok) throw Error(result.error || "Не удалось войти.");
  return result;
}
export const signIn = (login, password) =>
  request("login", { login, password });
export const signUp = (login, password) =>
  request("signup", { login, password });
export const recover = (login, password, recovery) =>
  request("recover", { login, password, recovery });
export const signOut = () => request("logout");
