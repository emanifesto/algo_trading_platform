# Agent Working Guidelines & Learned Behaviors

## Scope Boundaries & Minimal Intervention
- **Strict Task Scoping**: Only make changes that directly address the specific prompt. Do not proactively refactor surrounding code, change data fields, or alter existing data schemas unless explicitly instructed.
- **Data Schemas & Volume**: Respect the existing data pipeline selections (e.g. dropping `volume` or other columns when specified). Do not unilaterally re-add or retain dropped fields.

## React & Lightweight Charts Guidelines
- **Avoid Unnecessary `useRef` Boilerplate**: Do not add unnecessary `useRef` hooks (e.g., container DOM refs or chart instance refs) when a simple container element ID (like `'chartContainer'`) and scoped lifecycle management are sufficient.
- **Maintain Lean Components**: Only use refs when strictly required (such as retaining the series reference to call `.setData()` or `.update()` without recreating chart instances).
