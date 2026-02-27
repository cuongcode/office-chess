---
name: apply-barrel
description: Automates the "Barrel Export" convention for a component folder. Sets up and updates the master components index. Cleanup deep imports.
---

# Apply Barrel Export Skill

## Workflow
1. **Master Barrel**: Create/Update `index.ts` in `@/components` to include:
   ```typescript
   export * from './[ComponentName]';
   ```
2. **Import Cleanup**: Scan the project and update any "deep imports" (e.g., import {X} from '@/components/X/X') to use the clean root import (import {X} from '@/components').
