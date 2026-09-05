# Nagi UI · Deep Sea

Deep Sea is an owned Nagi UI reference application. It shows the same system at
two scales:

- a compact monitoring workspace composed from ordinary Vue templates;
- the 13 Nagi UI components used by that workspace, copied into the repository as owned source.

The visual theme lives in [`src/theme/deep-sea.css`](src/theme/deep-sea.css).
Application composition lives in [`src/views`](src/views), while the generated
ownership baseline remains visible under
[`src/components/nagi`](src/components/nagi).

## Run it

```sh
vp install
vp dev
```

The workspace exempts the pinned `@nagi-labs/nagi-ui@0.1.2` package and the
Nagi CSS `0.4.0` linter/core pair from the minimum-release-age gate so a fresh
checkout can install newly published Nagi releases immediately; every other
dependency remains subject to the default policy.
Unovis pulls `maplibre-gl` into its dependency graph, but this line-chart sample
does not use its map renderer, so that package's install script is explicitly
disabled in `pnpm-workspace.yaml`.

## 90-second Nagi CSS tour

1. Open the running Overview and choose **View page source**. The in-app source
   explorer shows the exact `DashboardView.vue` used to render the page, rather
   than a separately maintained example snippet. Its semantic template and
   scoped CSS live together, and each nested `>` step mirrors an owned
   parent-child edge.
2. Open [`src/components/SignalQualityCard.vue`](src/components/SignalQualityCard.vue).
   Nagi Card and Button roots stay opaque while declared slot surfaces reopen
   the Deep Sea-owned content. Unovis remains an explicit third-party boundary.
3. Change `--nagi-color-accent` in
   [`src/theme/deep-sea.css`](src/theme/deep-sea.css). The chart, focus states,
   status details, and owned components update from one semantic decision.
4. Open [`eslint.config.mjs`](eslint.config.mjs) to see the enforced Nagi CSS
   contract. A full local install can run `vp run lint` to verify surface names,
   semantic element classes, direct-child selector structure, component
   boundaries, runtime-state attributes, and semantic-token use.

The application intentionally has no catch-all global component stylesheet.
Each visible surface owns its markup and scoped CSS; the theme file owns only
shared design decisions and document-level defaults.

The `/components` source explorer imports the application files and the complete
`src/components/nagi` ownership baseline as raw build inputs. Page source,
component templates, and available Definition files therefore stay synchronized
with the deployed interface automatically. The route is loaded as a separate
browser chunk so those source strings do not increase the Overview's initial
JavaScript payload.

## Ownership baseline

The source was copied with the installed Nagi UI CLI, not duplicated by hand:

```sh
vp exec nagi-ui own badge button card carousel combobox dialog meter sidebar sidebar-link sidebar-section skeleton table toast
```

Every upstream-derived file carries an `@nagi-source` marker. Deep Sea-only
Implementation composables carry an `@deep-sea-source` marker instead. The
audit also rejects stale or unknown upstream bases. Verify the complete baseline with:

```sh
vp run audit:owned
```

Definition status is deliberately honest. Four of the used components currently carry a
verified Definition; the remaining entries are marked WIP rather than presented as
mechanically guaranteed.

## Theme and motion boundaries

Deep Sea replaces Nagi UI's semantic theme tokens and authors component-local
Button axes such as `--button-tone` and `--button-appearance`. The Nagi style
compiler validates and expands those finite values during the Vite build.
Canonical Nagi UI Blueprints and Deep Sea both use plain CSS. Templates keep the
same derived Nagi classes and nested selector structure, while the Deep Sea theme
provides the semantic color, spacing, type, radius, elevation, and stacking
tokens consumed by component declarations. Nagi CSS can therefore inspect both
the owned structure and every authored property. Repeated design values use
semantic tokens, component geometry remains ordinary CSS, and genuine one-off
optical corrections are named with local custom properties.
Component-owned public axes, such as Button's `--button-appearance`, remain
separate custom-property contracts.
The lint configuration also maps Motion's fixed intrinsic proxies to their
rendered HTML elements and treats `AnimatePresence` as transparent, so motion
does not make the owned selector tree opaque.

The signal chart uses Unovis inside a fixed-size card. The prerendered Overview
shows its complete page layout as Nagi Skeletons for at least 700 ms while
Unovis performs its browser-only layout. The dashboard replaces that single
skeleton surface only after both the minimum display time and Unovis's first
completed render. A continuous Deep Sea shimmer, driven by Motion over owned Nagi
Skeletons, makes the loading state explicit. The skeleton then crossfades into
the ready dashboard instead of disappearing in one frame. Station changes use
Unovis's 820 ms data interpolation without moving the card.

Application motion is being restored from a stable initial-render baseline, one
interaction at a time. Route transitions and the Overview's synchronized Toast
are currently active. Sync gives immediate rotational feedback before presenting
its Toast. The station telemetry uses native `<meter>` semantics with a Deep Sea
Motion indicator that springs from zero on initial hydration and whenever its
value changes, without changing layout.
Deep Sea also provides materially different Carousel, Combobox, Dialog, and Toast
Implementations across the Overview and dedicated verification routes.

The production build prerenders every route and hydrates the resulting markup.
This prevents a hard reload from briefly replacing the complete interface with
an empty SPA root. The inline document background is only a fallback before the
prerendered markup is painted.
Carousel mounts one keyed slide through `AnimatePresence` instead of retaining a
native-scroll viewport. It still satisfies the same `nagi/carousel@1` Component
Contract as the platform-first Blueprint, while its spatial exit, sync-mode
presence, and reduced-motion policy remain Implementation guarantees.

Dialog keeps the native `<dialog>` as the top-layer, modality, close-event, and
focus-restoration owner. A persistent Motion surface animates between open and
closed visual states inside it. Close requests finish that visual exit before
closing the native element, so Motion does not replace browser-owned behavior.

Toast retains Nagi's manager, announcement, timer-pausing, and focus-repair
behavior while presenting live notifications as a keyed vertical list.
`AnimatePresence` owns enter/exit retention, `layout` animates the remaining
items into place, and `useDeepSeaToast.ts` composes the complete Nagi Toast API
with only the native-popover exit handoff that Motion cannot own. This follows Motion's freely published
[Vue AnimatePresence modes example](https://motion.dev/examples/vue-animate-presence-modes).
The package Blueprint and Deep Sea
stack now execute the same `nagi/toast@1` Contract, while insertion, stacking,
retained exit DOM, and reflow remain in the Deep Sea Implementation Definition.

Combobox keeps the native input, auto popover, and `aria-activedescendant` focus
model as Behavior owners. Motion is confined to an inner popup surface and a
scoped shared-layout active indicator. Its current `nagi/combobox@2` runner
passes against the package and Deep Sea Implementations, but the Definition is
still shown as WIP until disabled, read-only, boundary, IME, pointer, and
controlled-state guarantees are added to the shared Contract.

Deep Sea always enables motion on the Overview so its Implementation choices
remain visible even when the browser requests reduced motion. This is a
deliberate showcase policy; production adaptations should respect
`prefers-reduced-motion`.

The shared Carousel, Combobox, Dialog, and Toast Contracts are executed from the
packed Nagi package rather than copied into this repository. Their fixtures are
available at `/carousel-contract`, `/combobox-contract`, `/dialog-contract`, and
`/toast-contract` for browser verification; they are not part of the public
command-deck navigation. Deep Sea keeps separate Implementation suites for the
Motion decisions that those shared Contracts intentionally do not prescribe.

## Verification

```sh
vp run format:check
vp run lint
vp run typecheck
vp run audit:owned
vp run test:browser
vp build
```

The repository installs the public registry release
`@nagi-labs/nagi-ui@0.1.2` directly. No packed local copy is committed. The
owned source remains self-contained in this repository, while the installed
package supplies the CLI, shared runtime helpers, and verification contracts.

## License

[MIT](LICENSE)
