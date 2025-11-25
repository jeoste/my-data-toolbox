# Design Document

## Overview

Ce document décrit l'architecture technique pour transformer l'application Electron "json-tools" en une application web moderne "my-data-toolbox" déployable sur Vercel. La solution adopte une architecture full-stack avec un frontend React statique et un backend Python serverless.

### Objectifs principaux

1. Migrer de l'architecture Electron vers une architecture web native
2. Renommer le projet de "json-tools" à "my-data-toolbox"
3. Déployer sur Vercel avec des serverless functions Python
4. Conserver toutes les fonctionnalités existantes
5. Maintenir la même expérience utilisateur (UI/UX)

### Contraintes techniques

- Vercel supporte Python 3.9+ dans les serverless functions
- Limite de 50 MB pour les serverless functions (incluant dépendances)
- Timeout de 10 secondes pour les fonctions serverless (plan gratuit)
- Limite de 10 MB pour les requêtes/réponses HTTP

## Architecture

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐         ┌────────────────────────┐ │
│  │   Static Frontend   │         │  Serverless Functions  │ │
│  │   (React + Vite)    │────────▶│     (Python API)       │ │
│  │                     │  HTTP   │                        │ │
│  │  - UI Components    │  REST   │  - /api/generate       │ │
│  │  - State Management │         │  - /api/anonymize      │ │
│  │  - Client Logic     │         │  - /api/analyze        │ │
│  └─────────────────────┘         └────────────────────────┘ │
│           │                                │                 │
│           │                                │                 │
│           ▼                                ▼                 │
│  ┌─────────────────────┐         ┌────────────────────────┐ │
│  │  Browser Storage    │         │   Python Modules       │ │
│  │  - localStorage     │         │   - data_generator.py  │ │
│  │  - sessionStorage   │         │   - data_anonymizer.py │ │
│  └─────────────────────┘         │   - swagger_parser.py  │ │
│                                   └────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Stack technique

**Frontend:**
- React 18 + TypeScript
- Vite 5 (build tool)
- Tailwind CSS + shadcn/ui
- i18next (internationalisation)
- Lucide React (icônes)
- JSONPath-Plus (requêtes JSONPath)

**Backend:**
- Python 3.9+
- Flask (framework web léger)
- Faker (génération de données)
- PyYAML (parsing Swagger)
- jsonschema (validation)

**Infrastructure:**
- Vercel (hébergement + serverless functions)
- GitHub (CI/CD automatique)

## Components and Interfaces

### 1. Structure du projet

```
my-data-toolbox/
├── api/                          # Serverless functions Python
│   ├── generate.py              # POST /api/generate
│   ├── anonymize.py             # POST /api/anonymize
│   └── analyze.py               # POST /api/analyze
├── src/                         # Frontend React
│   ├── components/
│   │   ├── views/               # Vues principales
│   │   │   ├── generate-view.tsx
│   │   │   ├── anonymize-view.tsx
│   │   │   ├── swagger-view.tsx
│   │   │   ├── validator-view.tsx
│   │   │   └── jsonpath-view.tsx
│   │   ├── ui/                  # Composants shadcn/ui
│   │   ├── layout.tsx           # Layout principal
│   │   └── theme-provider.tsx   # Provider de thème
│   ├── hooks/                   # Custom hooks
│   │   ├── use-api.ts          # Hook pour appels API
│   │   └── use-toast.ts        # Hook pour notifications
│   ├── lib/                     # Utilitaires
│   │   ├── api-client.ts       # Client API REST
│   │   └── utils.ts            # Fonctions utilitaires
│   ├── locales/                 # Traductions i18n
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── ko.json
│   ├── App.tsx                  # Composant racine
│   └── main.tsx                 # Point d'entrée
├── lib/                         # Modules Python partagés
│   ├── data_generator.py
│   ├── data_anonymizer.py
│   ├── json_processor.py
│   └── swagger_parser.py
├── public/                      # Assets statiques
├── vercel.json                  # Configuration Vercel
├── requirements.txt             # Dépendances Python
├── package.json                 # Dépendances Node.js
└── README.md                    # Documentation
```

### 2. API REST Backend

#### Endpoint: POST /api/generate

Génère des données JSON à partir d'un skeleton.

**Request:**
```json
{
  "skeleton": { ... },
  "swagger": { ... },  // optionnel
  "options": {
    "count": 5,
    "seed": 42,
    "pretty": true
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "generatedAt": "2025-11-25T10:30:00Z",
    "itemCount": 5
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Invalid skeleton format",
  "details": "..."
}
```

#### Endpoint: POST /api/anonymize

Anonymise des données JSON sensibles.

**Request:**
```json
{
  "data": { ... },
  "options": {
    "locale": "en_US"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "anonymizedFields": 12,
    "processedAt": "2025-11-25T10:30:00Z"
  }
}
```

#### Endpoint: POST /api/analyze

Analyse les champs sensibles dans des données JSON.

**Request:**
```json
{
  "data": { ... }
}
```

**Response (200):**
```json
{
  "success": true,
  "sensitiveFields": [
    "user.email",
    "user.phone",
    "address.street"
  ],
  "totalFields": 3
}
```

### 3. Frontend Components

#### Layout Component

Composant principal qui gère la navigation et la structure de la page.

```typescript
interface LayoutProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  children: React.ReactNode
}

// Responsabilités:
// - Afficher la sidebar de navigation
// - Gérer le changement de vue
// - Afficher le header avec sélecteur de langue/thème
// - Wrapper pour le contenu principal
```

#### View Components

Chaque vue correspond à une fonctionnalité principale.

**GenerateView:**
- Éditeur JSON pour le skeleton
- Éditeur optionnel pour le schéma Swagger
- Options de génération (count, seed)
- Bouton "Generate"
- Affichage du résultat

**AnonymizeView:**
- Éditeur JSON pour les données à anonymiser
- Bouton "Anonymize"
- Affichage avant/après
- Liste des champs sensibles détectés

**ValidatorView:**
- Éditeur JSON
- Validation en temps réel
- Formatage automatique (pretty-print)
- Affichage des erreurs

**JsonPathView:**
- Éditeur JSON pour les données
- Input pour la requête JSONPath
- Évaluation en temps réel
- Affichage des résultats

**SwaggerView:**
- Import de fichier Swagger/OpenAPI
- Visualisation du schéma
- Génération de skeleton
- Conversion JSON → OpenAPI

#### API Client

Service pour communiquer avec le backend.

```typescript
class APIClient {
  private baseURL: string

  async generate(skeleton: any, swagger?: any, options?: GenerateOptions): Promise<GenerateResponse>
  async anonymize(data: any, options?: AnonymizeOptions): Promise<AnonymizeResponse>
  async analyze(data: any): Promise<AnalyzeResponse>
  
  private async request<T>(endpoint: string, body: any): Promise<T>
  private handleError(error: any): never
}
```

### 4. State Management

Utilisation de React hooks pour la gestion d'état locale.

**Global State (Context):**
- Thème (light/dark)
- Langue (en/fr/ko)
- Configuration utilisateur

**Local State (useState):**
- Contenu des éditeurs JSON
- État de chargement
- Erreurs
- Résultats des opérations

## Data Models

### Frontend Types

```typescript
// Types pour les vues
type ViewType = 'generate' | 'anonymize' | 'swagger' | 'validator' | 'jsonpath'

// Options de génération
interface GenerateOptions {
  count?: number
  seed?: number
  pretty?: boolean
  locale?: string
}

// Options d'anonymisation
interface AnonymizeOptions {
  locale?: string
}

// Réponse API générique
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string
  metadata?: Record<string, any>
}

// Réponse de génération
interface GenerateResponse extends APIResponse<any> {
  metadata?: {
    generatedAt: string
    itemCount: number
  }
}

// Réponse d'anonymisation
interface AnonymizeResponse extends APIResponse<any> {
  metadata?: {
    anonymizedFields: number
    processedAt: string
  }
}

// Réponse d'analyse
interface AnalyzeResponse extends APIResponse<string[]> {
  sensitiveFields: string[]
  totalFields: number
}
```

### Backend Models

Les modules Python existants (data_generator.py, data_anonymizer.py) seront réutilisés sans modification majeure.

## Error Handling

### Frontend Error Handling

1. **Erreurs réseau:**
   - Afficher un toast d'erreur
   - Proposer de réessayer
   - Logger dans la console

2. **Erreurs de validation:**
   - Afficher les erreurs inline dans les éditeurs
   - Désactiver les boutons d'action
   - Afficher des messages d'aide

3. **Erreurs API:**
   - Parser le message d'erreur du backend
   - Afficher un toast avec le détail
   - Logger pour le debugging

```typescript
try {
  const result = await apiClient.generate(skeleton, swagger, options)
  setGeneratedData(result.data)
  toast.success('Data generated successfully')
} catch (error) {
  if (error instanceof APIError) {
    toast.error(error.message, {
      description: error.details
    })
  } else {
    toast.error('An unexpected error occurred')
  }
  console.error('Generation error:', error)
}
```

### Backend Error Handling

1. **Erreurs de validation:**
   - Retourner 400 Bad Request
   - Inclure un message d'erreur descriptif
   - Inclure les détails de validation

2. **Erreurs de traitement:**
   - Retourner 500 Internal Server Error
   - Logger l'erreur complète
   - Retourner un message générique à l'utilisateur

3. **Erreurs de timeout:**
   - Gérer les opérations longues
   - Suggérer de réduire la taille des données

```python
@app.route('/api/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        
        # Validation
        if 'skeleton' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: skeleton'
            }), 400
        
        # Traitement
        result = process_generation(data)
        
        return jsonify({
            'success': True,
            'data': result,
            'metadata': {
                'generatedAt': datetime.now().isoformat(),
                'itemCount': len(result) if isinstance(result, list) else 1
            }
        }), 200
        
    except ValidationError as e:
        return jsonify({
            'success': False,
            'error': 'Validation error',
            'details': str(e)
        }), 400
        
    except Exception as e:
        app.logger.error(f'Generation error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
```

## Testing Strategy

### Frontend Testing

1. **Unit Tests (Vitest):**
   - Tester les fonctions utilitaires
   - Tester les hooks personnalisés
   - Tester l'API client

2. **Component Tests (React Testing Library):**
   - Tester le rendu des composants
   - Tester les interactions utilisateur
   - Tester les états de chargement/erreur

3. **E2E Tests (Playwright - optionnel):**
   - Tester les flux utilisateur complets
   - Tester l'intégration frontend-backend

### Backend Testing

1. **Unit Tests (pytest):**
   - Tester les fonctions de génération
   - Tester les fonctions d'anonymisation
   - Tester le parsing Swagger

2. **Integration Tests:**
   - Tester les endpoints API
   - Tester les cas d'erreur
   - Tester les validations

### Testing Approach

- Tests unitaires pour la logique métier critique
- Tests d'intégration pour les endpoints API
- Tests manuels pour l'UI/UX
- Tests de performance pour les opérations longues

## Deployment Strategy

### Configuration Vercel

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.py": {
      "runtime": "python3.9",
      "maxDuration": 10
    }
  }
}
```

### Build Process

1. **Frontend Build:**
   ```bash
   npm run build
   # Génère les fichiers statiques dans dist/
   ```

2. **Backend Deployment:**
   - Les fichiers dans api/ sont automatiquement déployés comme serverless functions
   - Les dépendances Python sont installées automatiquement depuis requirements.txt

### CI/CD Pipeline

1. **Push vers GitHub:**
   - Vercel détecte automatiquement le push
   - Lance le build du frontend
   - Déploie les serverless functions

2. **Preview Deployments:**
   - Chaque PR génère un déploiement de preview
   - URL unique pour tester les changements

3. **Production Deployment:**
   - Merge vers main déclenche le déploiement production
   - Rollback automatique en cas d'erreur

### Environment Variables

Variables à configurer dans Vercel:

- `PYTHON_VERSION`: "3.9"
- `NODE_VERSION`: "18"
- (Autres variables selon les besoins futurs)

## Migration Plan

### Phase 1: Renommage (Requirement 1)

1. Renommer tous les packages "json-tools" → "my-data-toolbox"
2. Mettre à jour les URLs GitHub
3. Mettre à jour la documentation
4. Mettre à jour les métadonnées

### Phase 2: Restructuration (Requirements 2-4)

1. Créer la structure de projet web
2. Déplacer le code React existant
3. Créer les serverless functions Python
4. Configurer Vercel

### Phase 3: Migration des fonctionnalités (Requirements 5-8)

1. Migrer la génération de données
2. Migrer l'anonymisation
3. Migrer la validation et JSONPath
4. Migrer le support Swagger

### Phase 4: Fonctionnalités transversales (Requirements 9-13)

1. Implémenter l'i18n
2. Implémenter les thèmes
3. Implémenter la gestion des fichiers
4. Optimiser les performances
5. Sécuriser l'application

### Phase 5: Documentation et tests (Requirement 14)

1. Mettre à jour la documentation
2. Créer le guide de migration
3. Tester l'application complète
4. Déployer en production

## Performance Considerations

### Frontend Optimization

1. **Code Splitting:**
   - Lazy loading des vues
   - Chunking des dépendances

2. **Asset Optimization:**
   - Minification CSS/JS
   - Compression des images
   - Tree shaking

3. **Caching:**
   - Cache des traductions
   - Cache des préférences utilisateur
   - Service Worker (optionnel)

### Backend Optimization

1. **Cold Start Mitigation:**
   - Garder les fonctions légères
   - Minimiser les imports
   - Utiliser des dépendances optimisées

2. **Response Optimization:**
   - Compression gzip
   - Limiter la taille des réponses
   - Pagination pour les grandes listes

3. **Resource Management:**
   - Limiter la mémoire utilisée
   - Timeout appropriés
   - Gestion des erreurs rapide

## Security Considerations

### Frontend Security

1. **Input Validation:**
   - Valider tous les inputs utilisateur
   - Sanitiser les données avant affichage
   - Limiter la taille des fichiers

2. **XSS Prevention:**
   - Utiliser React (échappement automatique)
   - Éviter dangerouslySetInnerHTML
   - CSP headers

3. **Data Privacy:**
   - Ne pas stocker de données sensibles
   - Avertir l'utilisateur sur la confidentialité
   - Traitement local quand possible

### Backend Security

1. **Input Validation:**
   - Valider tous les payloads JSON
   - Limiter la taille des requêtes
   - Rejeter les formats invalides

2. **Rate Limiting:**
   - Limiter le nombre de requêtes par IP
   - Prévenir les abus

3. **Error Handling:**
   - Ne pas exposer les détails internes
   - Logger les erreurs de manière sécurisée
   - Messages d'erreur génériques

## Internationalization

### Implementation

1. **i18next Configuration:**
   ```typescript
   i18n
     .use(LanguageDetector)
     .use(initReactI18next)
     .init({
       resources: {
         en: { translation: enTranslations },
         fr: { translation: frTranslations },
         ko: { translation: koTranslations }
       },
       fallbackLng: 'en',
       detection: {
         order: ['localStorage', 'navigator'],
         caches: ['localStorage']
       }
     })
   ```

2. **Translation Files:**
   - Structure par namespace
   - Clés descriptives
   - Pluralisation supportée

3. **Usage:**
   ```typescript
   const { t } = useTranslation()
   <Button>{t('generate.button')}</Button>
   ```

## Theme System

### Implementation

1. **CSS Variables:**
   - Définir les couleurs dans globals.css
   - Utiliser hsl() pour les variations
   - Support dark/light mode

2. **Theme Provider:**
   ```typescript
   const ThemeProvider = ({ children }) => {
     const [theme, setTheme] = useState<'light' | 'dark'>('dark')
     
     useEffect(() => {
       const root = window.document.documentElement
       root.classList.remove('light', 'dark')
       root.classList.add(theme)
     }, [theme])
     
     return (
       <ThemeContext.Provider value={{ theme, setTheme }}>
         {children}
       </ThemeContext.Provider>
     )
   }
   ```

3. **Persistence:**
   - Sauvegarder dans localStorage
   - Détecter la préférence système
   - Appliquer au chargement

## Conclusion

Cette architecture permet de migrer l'application Electron vers une solution web moderne tout en conservant toutes les fonctionnalités existantes. L'utilisation de Vercel simplifie le déploiement et l'infrastructure, tandis que la réutilisation du code React existant minimise les efforts de développement.

Les points clés de cette architecture sont:
- Séparation claire frontend/backend
- Réutilisation maximale du code existant
- Déploiement simplifié sur Vercel
- Performance optimisée
- Sécurité renforcée
- Expérience utilisateur préservée
