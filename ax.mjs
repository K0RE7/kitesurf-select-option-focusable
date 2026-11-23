// Raw CDP, no dependencies (Node 22+ global WebSocket).
// Usage: node ax.mjs <browser ws endpoint> <page url>
// Prints every combobox / listbox / option node of Accessibility.getFullAXTree with its properties.
const [ws, url] = process.argv.slice(2);
const sock = new WebSocket(ws);
await new Promise((r, e) => { sock.onopen = r; sock.onerror = e; });
let id = 0;
const pending = new Map();
sock.onmessage = ({ data }) => {
  const m = JSON.parse(data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
    sock.send(JSON.stringify({ id: n, method, params, sessionId }));
  });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Page.navigate", { url }, sessionId);
await new Promise((r) => setTimeout(r, 1500));
const { nodes } = await send("Accessibility.getFullAXTree", {}, sessionId);
for (const n of nodes) {
  const role = n.role?.value;
  if (!["combobox", "listbox", "option"].includes(role)) continue;
  const props = (n.properties ?? []).map((p) => (p.value.value === true ? p.name : `${p.name}=${p.value.value}`));
  console.log(`${role.padEnd(8)} ${JSON.stringify(n.name?.value ?? "").padEnd(26)} ${n.ignored ? "(ignored) " : ""}[${props.join(", ")}]`);
}
sock.close();
