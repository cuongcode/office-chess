---
name: refactor-component
description: Identifies repetitive TSX/JSX/Tailwind patterns and extracts TSX/JSX into a sub-component. Offers two modes: "Internal" (private to the file) or "External" (moved to the /components directory).
---

# Refactor Component Skill
When this skill is activated, you must act as a Senior Frontend Architect. Follow these steps strictly to ensure the codebase remains scalable.

## Workflow
1. **Analysis**: Identify a logical UI block or repetitive TSX/JSXTailwind.
2. **Strategy Selection**: Ask the user to choose between:
   - **Option A (Internal)**: Keep the new component in the *same file* but move it outside the main function. Best for "one-off" cleanups where the component won't be reused elsewhere.
   - **Option B (External)**: Move the component to a new file in `@/components/[ComponentName].tsx`. Best for shared, reusable UI.

## Implementation Rules
- Use **TypeScript** for all props.
- Implement **Early Returns** for conditional rendering.
- Use `clsx` for the `className` prop to ensure flexibility.

## Strict Export Rules
- **NO DEFAULT EXPORTS**: You must use named exports: `export const ComponentName = ...`.
- This ensures consistency across the project and better IDE auto-import reliability.

## Education
- Explain the logic for the chosen extraction. If it's **Internal**, explain how it reduces "Cognitive Load." If it's **External**, explain "DRY" (Don't Repeat Yourself) principles.