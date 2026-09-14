# Observability prototype

Standalone React prototype of a Dynatrace Strato-inspired product.

## Run

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (typically `http://localhost:5173`).

## Screens

Use the left navigation rail:

- **Dashboards** → Release Monitoring
- **Logs** → Log volume and patterns
- **Notebooks** → Payment rollout investigation (Document / Investigation)

## Scope

- Local mock data only (no Dynatrace APIs)
- Capture observation from Release Monitoring without leaving the dashboard
- Notebook Investigation mode with hypothesis decisioning
- Simplified Document mode of the same Notebook
- Logs screen with facets, volume chart, and patterns

Traces screen is intentionally not implemented yet.
