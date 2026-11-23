# Kitesurf: `<option>` elements are not focusable in the accessibility tree

`<option>` nodes in Kitesurf's `Accessibility.getFullAXTree` never get the `focusable` property. Chrome sets it on every enabled option in a `<select>`. Puppeteer's `page.accessibility.snapshot()` keeps a child of a combobox only if it is focusable, so on Kitesurf every `<select>` comes back without its options.

## Run it

```sh
npm install
node serve.mjs 8931                                                  # serves select.html and parity.html on 127.0.0.1
node ax.mjs       <ws endpoint> http://127.0.0.1:8931/select.html    # raw CDP, no dependencies (Node 22+)
node snapshot.mjs <ws endpoint> http://127.0.0.1:8931/select.html    # Puppeteer snapshot
```

`<ws endpoint>` is a browser-level CDP endpoint: Kitesurf's `/devtools/browser`, or Chrome's `webSocketDebuggerUrl` from `/json/version`. `parity.html` adds a disabled option, a disabled `<optgroup>`, a disabled `<select>` and a datalist.

## Results

| Engine | Options in `getFullAXTree` | Snapshot of `select.html` | Output |
| --- | --- | --- | --- |
| Chrome 157 | `focusable` | combobox with both options | `results/chrome.txt` |
| Kitesurf `main` at d430ad9 | no `focusable` | combobox with no options | `results/kitesurf-d430ad9.txt` |
| Kitesurf d430ad9 with the patch | `focusable` | combobox with both options | `results/kitesurf-d430ad9-patched.txt` |

With the patch, disabled options and options in a disabled `<optgroup>` stay unfocusable and are left out of the snapshot, as in Chrome.

## Patch

`0001-Mark-option-in-a-select-as-focusable-in-the-accessibility-tree.patch`, against Kitesurf `main` at d430ad9. It adds the rule where `packages/core/src/dom/accessibility.rs` sets the `focusable` property and leaves `fn focusable` as a DOM rule. The existing test `accessibility_full_uses_live_state_labels_and_document_base` expects options without `focusable`, so its expected properties need `focusable` added.
