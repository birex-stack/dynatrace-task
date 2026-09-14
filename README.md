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
- **Notebooks** → Payment rollout investigation (Document / Investigation)

## Scope

- Local mock data only (no Dynatrace APIs)
- Capture observation from Release Monitoring without leaving the dashboard
- Notebook Investigation mode with hypothesis decisioning
- Simplified Document mode of the same Notebook

Logs and Traces screens are intentionally not implemented yet.
