# Nagi UI · Deep Sea

Deep Sea is an owned Nagi UI reference application. It shows the same system at
two scales:

- a working ocean-observation command deck composed from ordinary Vue templates;
- all 64 canonical Nagi UI components copied into the repository as owned source.

The visual theme lives in [`src/theme/deep-sea.css`](src/theme/deep-sea.css).
Application composition lives in [`src/views`](src/views), while the generated
ownership baseline remains visible under
[`src/components/nagi`](src/components/nagi).

## Run it

```sh
vp install
vp dev
```

The workspace exempts only the pinned `@nagi-labs/nagi-ui@0.1.0` release from
the minimum-release-age gate so a fresh StackBlitz can install the release on
publication day; every other dependency remains subject to the default policy.

Open the project directly in StackBlitz once the repository is pushed:

```text
https://stackblitz.com/github/nagi-labs/nagi-ui-deep-sea
```

## Ownership baseline

The source was copied with the installed Nagi UI CLI, not duplicated by hand:

```sh
vp exec nagi-ui own accordion autocomplete … tooltip
```

Every copied file carries an `@nagi-source` marker. Verify the complete baseline
with:

```sh
vp run audit:owned
```

Definition status is deliberately honest. Nine components currently carry a
verified Definition; the remaining component pages are marked WIP rather than
presented as mechanically guaranteed.

## Theme and motion boundaries

Deep Sea replaces Nagi UI's semantic theme tokens and authors component-local
Button axes such as `--button-tone` and `--button-appearance`. The Nagi style
compiler validates and expands those finite values during the Vite build.

Motion for Vue is used by the application layer for page and section entrance.
Owned Nagi components retain native focus, popover, and dialog behavior.
`prefers-reduced-motion` removes both Motion durations and ambient sonar motion.

## Verification

```sh
vp run format:check
vp run lint
vp run typecheck
vp run audit:owned
vp run test:browser
vp build
```

The repository installs the public `@nagi-labs/nagi-ui@0.1.0` package. The
owned source remains self-contained in this repository, while the installed
package supplies the CLI, shared runtime helpers, and verification contracts.

## License

[MIT](LICENSE)
