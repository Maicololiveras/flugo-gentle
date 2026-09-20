# Stage the plugin in Gentle AI

The visualizer is a Pi extension package. This integration stages it under `gentle-ai/plugins/gentle-live-observer` so a local agent can complete the optional Gentle AI installer integration and visual acceptance tests.

From this repository:

```sh
node integrations/gentle-ai/stage-plugin.mjs /path/to/gentle-ai
node integrations/gentle-ai/stage-plugin.mjs /path/to/gentle-ai --apply
```

Then, from the Gentle AI checkout:

```sh
pi install ./plugins/gentle-live-observer
```

Reload your Gentle session and run `/gentle-live`. Use the URL printed by Pi.

Start with [LOCAL_AGENT_HANDOFF.md](LOCAL_AGENT_HANDOFF.md) for exact implementation boundaries, installation work remaining, automated visual tests, real-session cases and evidence requirements. The package already loads through Pi; automatic discovery in Gentle AI's installer and official upstream acceptance remain pending.
