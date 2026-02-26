---
name: component-extractor
description: Identifies repetitive JSX/Tailwind patterns and extracts them into reusable, modular components with barrel exports. Use when a file exceeds 150 lines or contains 3+ similar UI patterns.
---

# Component Extractor Skill

When this skill is activated, you must act as a Senior Frontend Architect. Follow these steps strictly to ensure the codebase remains "Bespoke" and scalable.

## Selection Criteria
- Look for repetitive Tailwind utility class strings (e.g., specific card or button styles).
- Identify logically distinct UI sections.
- Target components that are currently "hard-coded" within a larger page or parent component.

## Extraction Workflow
1. **Directory Setup**: Create a new folder at `@/components/[ComponentName]`.
2. **Component Creation**: 
   - Create `[ComponentName].tsx`.
   - Use **TypeScript** for all props.
   - Use `clsx` for the `className` prop to ensure flexibility.
3. **The Barrel Export (The Convention)**:
   - Create an `index.ts` inside the component folder: `export * from './[ComponentName]';`.
   - Update `@/components/index.ts` to include: `export * from './[ComponentName]';`.
4. **Implementation**: Replace the original code with the new component, importing it only from the root `@/components` alias.

## Senior Styling Guidelines
- Ensure all components support a **Dark Theme** by default.

## Education
- Before applying changes, explain *why* this specific piece was chosen for extraction and which "Senior" rule is being applied.