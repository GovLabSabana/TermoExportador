# TermoExportador Frontend - Development Guidelines

## Project Overview
Este proyecto es una aplicación Next.js (v15.4.5) desarrollada en JavaScript (no TypeScript) enfocada en la recolección de datos mediante formularios extensos y análisis visual de información a través de dashboards y gráficas.

## Folder Structure

```
src/
├── app/                     # Next.js App Router
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   └── (routes)/           # Rutas organizadas por features
│       ├── dashboard/
│       ├── forms/
│       └── analytics/
├── components/             # Componentes reutilizables
│   ├── ui/                # Componentes base (buttons, inputs, etc.)
│   ├── forms/             # Componentes específicos de formularios
│   ├── charts/            # Componentes de visualización
│   ├── layout/            # Header, Footer, Navigation
│   └── common/            # Componentes compartidos
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuraciones
│   ├── utils.js          # Funciones utilitarias
│   ├── api.js            # Cliente API
│   ├── validations.js    # Esquemas de validación
│   └── constants.js      # Constantes globales
├── store/                # Manejo de estado global
├── styles/               # Estilos adicionales (si necesario)
└── types/                # JSDoc types definitions (opcional)
```

## Naming Conventions

### Folders
- **kebab-case**: `user-management`, `data-analysis`
- **Descriptive**: nombres que reflejen la funcionalidad

### Components
- **PascalCase**: `UserForm`, `DataChart`, `DashboardLayout`
- **Descriptive**: `FormStepIndicator`, `SalesAnalyticsChart`

### Files
- **kebab-case** para archivos: `user-form.js`, `sales-chart.js`
- **PascalCase** para componentes: `UserForm.js`, `SalesChart.js`
- **camelCase** para utilidades: `apiHelpers.js`, `dataUtils.js`

### Functions and Variables
- **camelCase**: `getUserData`, `calculateTotal`, `isFormValid`
- **Descriptive**: funciones deben explicar qué hacen
- **Boolean variables**: usar prefijos `is`, `has`, `can`: `isLoading`, `hasError`, `canSubmit`

## Code Organization Rules

### Domain/Feature Separation
```
src/app/
├── dashboard/          # Dashboard feature
│   ├── page.js
│   ├── components/     # Componentes específicos del dashboard
│   └── lib/           # Lógica específica del dashboard
├── forms/
│   ├── survey/        # Formulario específico
│   └── evaluation/    # Otro formulario específico
```

### Custom Hooks Location
- Hooks globales: `src/hooks/`
- Hooks específicos: dentro de la feature `src/app/feature/hooks/`

### Assets Organization
```
public/
├── images/
├── icons/
└── documents/
```

## Coding Style

### Indentation
- **2 spaces** (configurado en el proyecto)
- **No tabs**

### Naming Conventions
- **Variables/Functions**: camelCase
- **Components**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **CSS Classes**: kebab-case (siguiendo Tailwind CSS)

### Comments
```javascript
// Comentarios de una línea para explicar lógica compleja
// Usar JSDoc para funciones importantes

/**
 * Calcula el total de puntos basado en las respuestas del formulario
 * @param {Object[]} answers - Array de respuestas del formulario
 * @param {Object} weights - Pesos para cada categoría
 * @returns {number} Total calculado
 */
function calculateFormScore(answers, weights) {
  // Implementación...
}
```

### Prop Types
- **No usar PropTypes** (proyecto en JavaScript puro)
- **Usar JSDoc** para documentar props:

```javascript
/**
 * @param {Object} props
 * @param {string} props.title - Título del formulario
 * @param {Function} props.onSubmit - Callback al enviar
 * @param {boolean} props.isLoading - Estado de carga
 */
export default function FormComponent({ title, onSubmit, isLoading }) {
  // ...
}
```

## Form Management

### Recommended Libraries
1. **React Hook Form** - Para manejo de formularios complejos
2. **Zod** - Para validaciones (ya que mencionas que lo usas)

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Form Structure
```javascript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { surveySchema } from '@/lib/validations'

export default function SurveyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(surveySchema)
  })
  
  // ...
}
```

### Multi-step Forms
```
src/components/forms/
├── MultiStepForm.js      # Container principal
├── FormStep.js           # Componente para cada paso
├── StepIndicator.js      # Indicador visual de progreso
└── FormNavigation.js     # Botones siguiente/anterior
```

### Validation with Zod
```javascript
// src/lib/validations.js
import { z } from 'zod'

export const surveySchema = z.object({
  personalInfo: z.object({
    name: z.string().min(2, 'Nombre requerido'),
    email: z.string().email('Email inválido')
  }),
  responses: z.array(z.object({
    questionId: z.string(),
    value: z.union([z.string(), z.number()])
  }))
})
```

## Data Visualization

### Recommended Libraries
1. **Recharts** - Para gráficas React-friendly
2. **Chart.js con react-chartjs-2** - Para gráficas más complejas
3. **D3.js** - Para visualizaciones personalizadas avanzadas

```bash
npm install recharts
# o
npm install chart.js react-chartjs-2
```

### Chart Components Structure
```
src/components/charts/
├── BaseChart.js          # Componente base común
├── BarChart.js           # Gráfica de barras
├── LineChart.js          # Gráfica de líneas
├── PieChart.js           # Gráfica circular
└── DashboardChart.js     # Wrapper para dashboards
```

### Visual Standards
```javascript
// src/lib/constants.js
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444'
}

export const CHART_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top'
    }
  }
}
```

## State Management

### Recommended Approach
1. **React Context API** - Para estado global simple
2. **Zustand** - Para estado más complejo (recomendado para este tipo de proyecto)

```bash
npm install zustand
```

### Store Structure
```javascript
// src/store/formStore.js
import { create } from 'zustand'

export const useFormStore = create((set) => ({
  currentStep: 0,
  formData: {},
  isSubmitting: false,
  setCurrentStep: (step) => set({ currentStep: step }),
  updateFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  setSubmitting: (status) => set({ isSubmitting: status })
}))
```

## Error Handling

### Global Error Boundary
```javascript
// src/components/ErrorBoundary.js
export default function ErrorBoundary({ children }) {
  // Implementar error boundary para capturar errores de React
}
```

### API Error Handling
```javascript
// src/lib/api.js
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, options)
    if (!response.ok) {
      throw new ApiError('Request failed', response.status)
    }
    return await response.json()
  } catch (error) {
    // Manejar errores de red, parsing, etc.
    throw error
  }
}
```

## Railway Deployment Best Practices

### Environment Variables
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  },
  // Railway-specific optimizations
  output: 'standalone'
}

export default nextConfig
```

### Build Optimization
```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "railway:build": "npm run build && npm prune --production"
  }
}
```

## Testing Strategy (Future Implementation)

### Recommended Tools
1. **Jest** - Unit testing
2. **React Testing Library** - Component testing
3. **Playwright** - E2E testing for formularios

## Performance Guidelines

### Code Splitting
```javascript
// Dynamic imports para formularios grandes
const HeavyFormComponent = dynamic(() => import('./HeavyFormComponent'), {
  loading: () => <FormSkeleton />
})
```

### Data Fetching
```javascript
// src/lib/api.js - implementar caching básico
const cache = new Map()

export async function getCachedData(key, fetcher) {
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  const data = await fetcher()
  cache.set(key, data)
  return data
}
```

## Development Commands

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Linting
npm run lint

# Deploy en Railway
git push origin main  # Auto-deploy configurado
```

## Code Review Checklist

- [ ] Nombres descriptivos y consistentes
- [ ] Componentes pequeños y enfocados
- [ ] Validaciones implementadas correctamente
- [ ] Manejo de errores apropiado
- [ ] Responsive design implementado
- [ ] Accesibilidad básica considerada
- [ ] Performance optimizada (lazy loading, memoization)

---

**Nota**: Esta guía debe evolucionar con el proyecto. Actualizar cuando se agreguen nuevas librerías o patrones.