# sbx-opencode — arc toolchain kit for opencode

A [Docker Sandboxes](https://docs.docker.com/ai/sandboxes/customize/) **mixin kit**
that equips an `opencode` sandbox with the arc repo's development toolchain:

- installs [mise](https://mise.jdx.dev) (version- and digest-pinned),
- provisions **bun 1.3** and **node 24** from the repo's `mise.toml`,
- pre-warms dependencies with `bun install`,
- wires mise shims into interactive shells *and* `bash -c` tool shells
  (via `BASH_ENV`),
- injects **proxy-managed credentials** for the **Z.AI GLM Coding Plan** and
  **OpenCode Go** model providers.

## Usage

From the repo root:

```console
$ sbx run opencode --kit ./sbx-opencode/ .
```

First creation runs the kit's install steps (mise, bun + node, `bun install`)
and prompts once to approve the `zai` / `opencode-go` credential domains —
after that, starts are fast.

## Daily workflow

The workspace is **bind-mounted live**: the agent's edits land directly in
your checkout on the host; run `bun test` inside or outside, same files.

```console
$ sbx run opencode --kit ./sbx-opencode/ .   # create (first time) + attach
$ sbx run --name <sandbox>                   # re-attach (agent read from spec)
$ sbx ls                                     # list sandboxes + state
$ sbx exec <sandbox> -- bun test             # headless command inside
$ sbx stop <sandbox>                         # stop, keep it
$ sbx rm <sandbox>                           # remove for good
$ sbx tui                                    # dashboard
```

Sandboxes default to the name `<agent>-<workdir>`, so different directories
never collide.

## Worktrees: one sandbox per worktree

A worktree is just another directory — create the sandbox from inside it.
**Prerequisite:** `mise.toml` and `sbx-opencode/` must be committed, since a
fresh worktree contains only committed files (without `mise.toml` the kit
skips the toolchain install).

```console
# from the main checkout
$ git worktree add ../arc-my-feature my-feature

# sandbox for that worktree (own name, own tools, own bun install)
$ cd ../arc-my-feature
$ sbx run --name arc-my-feature opencode --kit ./sbx-opencode/ .

# ...work; re-attach any time:
$ sbx run --name arc-my-feature

# when the branch merges and the worktree goes away:
$ sbx rm arc-my-feature
```

Each worktree sandbox gets its own mise-installed toolchain and its own
`node_modules` (pre-warmed at creation). Credentials are shared host-side —
no re-login needed.

## Model provider secrets (one-time, per host)

The kit declares two credentials. Bind them once so `sbx` can inject them —
the API keys stay in the host secret store; the container only ever sees the
`proxy-managed` sentinel, which the sandbox egress proxy exchanges for the
real `Authorization: Bearer` key:

```console
$ sbx secret set zai <zai-api-key>          # from z.ai/manage-apikey/apikey-list
$ sbx secret set opencode-go <opencode-key> # from opencode.ai/auth (Go plan)
```

(If you already store these as sbx service secrets named `zai` and
`opencode-go` — check `sbx secret ls` — you're done; the kit's service ids
match, and the first `sbx run` only asks you to approve the inject domains.)

These map onto the env vars opencode reads from its models.dev registry:

| Provider (registry id)   | Env var          | Endpoint                      |
| ------------------------ | ---------------- | ----------------------------- |
| `zai-coding-plan`        | `ZHIPU_API_KEY`  | `https://api.z.ai/api/coding/paas/v4` |
| `opencode-go` (and `opencode`/Zen) | `OPENCODE_API_KEY` | `https://opencode.ai/zen/go/v1` |

Pick a model with `/models` (e.g. `zai-coding-plan/glm-5.3`).

**Alternative:** skip the secrets and run `/connect` (Z.AI Coding Plan /
OpenCode Go) inside the sandbox TUI once — the login is written to
`/home/agent/.local/share/opencode`, which the kit mounts as a persistent
volume so it survives restarts and recreations. The proxy-managed route above
is preferred: the raw key never lands in container storage.

If requests get blocked, check `sbx policy log <sandbox>` for denied hosts.

## Files

- `spec.yaml` — kit declaration (credentials, install steps, network
  allowlist, agent memory)
- `files/home/.config/mise/env.sh` — PATH shim sourced by non-interactive shells

## Network contract

The kit allows exactly: `github.com`, `api.github.com`,
`objects.githubusercontent.com`, `release-assets.githubusercontent.com`
(mise + bun releases), `nodejs.org` (node dist), `registry.npmjs.org`
(bun install), `api.z.ai` + `opencode.ai` (model providers). Anything else
the agent needs must be allowed by the base agent or another kit.

## Bumping mise

Edit `MISE_VERSION` and the two `SHA256` checksums in `spec.yaml`
(sourced from the release's `SHASUMS256.txt`
on [jdx/mise releases](https://github.com/jdx/mise/releases)).
