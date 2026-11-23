// Puppeteer's accessibility snapshot, the one chrome-devtools-mcp's take_snapshot uses.
// Usage: node snapshot.mjs <browser ws endpoint> <page url>
import puppeteer from "puppeteer-core";
const [ws, url] = process.argv.slice(2);
const browser = await puppeteer.connect({ browserWSEndpoint: ws });
const page = await browser.newPage();
await page.goto(url);
const print = (n, depth = 0) => {
  console.log(`${"  ".repeat(depth)}${n.role} ${JSON.stringify(n.name ?? "")}${n.focused ? " focused" : ""}`);
  for (const c of n.children ?? []) print(c, depth + 1);
};
print(await page.accessibility.snapshot());
await browser.disconnect();
