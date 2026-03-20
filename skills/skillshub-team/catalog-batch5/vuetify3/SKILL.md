# Vuetify 3

## Setup
```bash
npm install vuetify @mdi/font
```

## Plugin
```typescript
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
export default createVuetify({ components, theme: {
    themes: { light: { colors: { primary: '#1976D2' } } } } });
```

## Key Components
- v-app, v-app-bar, v-navigation-drawer — Layout
- v-btn, v-text-field, v-select, v-checkbox — Forms
- v-data-table — Sortable, filterable data tables
- v-card, v-list, v-chip — Content display
- v-dialog, v-snackbar — Overlays