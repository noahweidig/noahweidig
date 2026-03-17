
## 2025-03-17 - Localized Third-Party SVG for Performance
**Learning:** Third-party API-driven SVG generation services (like capsule-render) add measurable latency (~200ms+ TLS/DNS overhead) to documentation rendering. Because the APIs often output standard SMIL-animated SVGs, the animations function perfectly when the SVG is downloaded and hosted as a static local file.
**Action:** Always check if dynamic third-party status or decorative images can be safely downloaded as static SVG files to eliminate external network dependencies, especially if the API output doesn't rely on realtime context (like build status or viewer counts).
