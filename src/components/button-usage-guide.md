# Guide d'Utilisation des Boutons - Palette HSL Personnalisée

## 🎨 Palette de Couleurs Cohérente

Votre projet utilise une palette de couleurs HSL personnalisée basée sur les teintes bleues (212-214°) pour les éléments principaux et des couleurs sémantiques spécifiques pour les actions contextuelles.

## 📋 Variantes Disponibles

### Boutons Principaux

```tsx
// Bouton principal (actions primaires)
<Button variant="default">
  <Settings className="w-4 h-4 mr-2" />
  Configurer
</Button>

// Bouton secondaire (actions alternatives)
<Button variant="secondary">
  <Download className="w-4 h-4 mr-2" />
  Télécharger
</Button>
```

### Boutons Sémantiques

```tsx
// Succès (confirmations, enregistrements)
<Button variant="success">
  <CheckCircle className="w-4 h-4 mr-2" />
  Valider
</Button>

// Avertissement (actions à confirmer)
<Button variant="warning">
  <AlertTriangle className="w-4 h-4 mr-2" />
  Effacer
</Button>

// Danger (suppressions, actions destructives)
<Button variant="danger">
  <Trash2 className="w-4 h-4 mr-2" />
  Supprimer
</Button>

// Information (aide, détails)
<Button variant="info">
  <Info className="w-4 h-4 mr-2" />
  En savoir plus
</Button>
```

## 🎯 Quand Utiliser Chaque Variante

### ✅ `success` - Vert (HSL: 147° 19% 36%)
**Utiliser pour :**
- Validation de formulaires
- Enregistrement de données
- Confirmation d'actions
- Boutons "Continuer", "Valider", "Confirmer"

### ⚠️ `warning` - Jaune (HSL: 52° 23% 34%)
**Utiliser pour :**
- Actions qui effacent des données
- Réinitialisation de formulaires
- Actions réversibles mais importantes
- Boutons "Effacer", "Réinitialiser", "Modifier"

### 🚨 `danger` - Rouge (HSL: 9° 21% 41%)
**Utiliser pour :**
- Suppression définitive
- Actions destructives irréversibles
- Déconnexion/Désinscription
- Boutons "Supprimer", "Annuler définitivement"

### ℹ️ `info` - Bleu (HSL: 217° 22° 41%)
**Utiliser pour :**
- Import/Export de fichiers
- Ouverture de dialogues d'aide
- Navigation vers des détails
- Boutons "Importer", "Voir", "Détails"

### 🎨 `secondary` - Orange (HSL: 38° 100% 17%)
**Utiliser pour :**
- Actions secondaires importantes
- Téléchargements
- Exports alternatifs
- Fonctionnalités premium

## 💡 Exemples Pratiques

### Formulaire de Validation JSON
```tsx
// ✅ CORRECT
<Button variant="success" onClick={validateJson}>
  <CheckCircle className="w-4 h-4 mr-2" />
  Valider JSON
</Button>

<Button variant="info" onClick={importFile}>
  <Upload className="w-4 h-4 mr-2" />
  Importer
</Button>

<Button variant="warning" onClick={clearForm}>
  <RotateCcw className="w-4 h-4 mr-2" />
  Effacer
</Button>
```

### Actions de Gestion de Données
```tsx
// ✅ CORRECT
<Button variant="success" onClick={saveData}>
  <Save className="w-4 h-4 mr-2" />
  Enregistrer
</Button>

<Button variant="danger" onClick={deleteItem}>
  <Trash2 className="w-4 h-4 mr-2" />
  Supprimer
</Button>

<Button variant="outline" onClick={cancel}>
  Annuler
</Button>
```

## 🚫 À Éviter

### ❌ Mauvaises Pratiques
```tsx
// ❌ NE PAS FAIRE : Utiliser "danger" pour une action réversible
<Button variant="danger" onClick={clearForm}>Effacer</Button>

// ❌ NE PAS FAIRE : Utiliser "success" pour la navigation
<Button variant="success" onClick={goToSettings}>Paramètres</Button>

// ❌ NE PAS FAIRE : Mélanger les variantes sans logique
<div>
  <Button variant="danger">Sauvegarder</Button>
  <Button variant="success">Supprimer</Button>
</div>
```

### ✅ Bonnes Pratiques
```tsx
// ✅ CORRECT : Couleurs cohérentes avec l'action
<Button variant="warning" onClick={clearForm}>Effacer</Button>
<Button variant="info" onClick={goToSettings}>Paramètres</Button>

// ✅ CORRECT : Groupement logique
<div>
  <Button variant="success">Sauvegarder</Button>
  <Button variant="danger">Supprimer</Button>
  <Button variant="outline">Annuler</Button>
</div>
```

## 🎨 Variables CSS Disponibles

```css
/* Mode Clair */
--primary: hsl(209 71% 28%);
--secondary: hsl(38 100% 17%);
--danger: hsl(9 21% 41%);
--warning: hsl(52 23% 34%);
--success: hsl(147 19% 36%);
--info: hsl(217 22% 41%);

/* Mode Sombre */
--primary: hsl(209 71% 72%);
--secondary: hsl(38 100% 83%);
--danger: hsl(9 21% 59%);
--warning: hsl(52 23% 66%);
--success: hsl(147 19% 64%);
--info: hsl(217 22% 59%);
```

## 🔧 Configuration Tailwind

Les couleurs sont automatiquement disponibles dans Tailwind CSS :

```css
/* Classes générées automatiquement */
.bg-success { background-color: var(--success); }
.text-danger { color: var(--danger); }
.border-warning { border-color: var(--warning); }
.ring-info { --tw-ring-color: var(--info); }
```

## 📊 Testez Votre Palette

Utilisez le composant `<ButtonDemo />` pour visualiser tous les boutons :

```tsx
import { ButtonDemo } from '@/components/button-demo'

// Dans votre vue de développement
<ButtonDemo />
```

---

**💡 Conseil :** Respectez cette palette pour maintenir une interface cohérente et professionnelle. En cas de doute, utilisez `variant="outline"` pour les actions neutres. 