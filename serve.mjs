// Serves this folder on 127.0.0.1 and prints the base URL. Usage: node serve.mjs [port]
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
const dir = new URL(".", import.meta.url);
createServer((req, res) => {
  const name = new URL(req.url, "http://x").pathname.slice(1);
  try {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(readFileSync(new URL(name.match(/^[\w-]+\.html$/) ? name : "select.html", dir)));
  } catch { res.writeHead(404); res.end(); }
}).listen(Number(process.argv[2] ?? 0), "127.0.0.1", function () {
  console.log(`http://127.0.0.1:${this.address().port}`);
});
