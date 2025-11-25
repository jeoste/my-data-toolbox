# Guide d'Utilisation des Toasts - Palette HSL Personnalisée

## 🎨 Variantes Disponibles

Le système de toasts utilise maintenant votre palette de couleurs HSL personnalisée avec des variantes spécifiques pour chaque type de message.

### 🎯 Types de Toast

```tsx
import { useToast } from '@/hooks/use-toast-simple'

const { toast } = useToast()

// ✅ Succès (vert) - Actions réussies
toast({
  title: "Opération réussie",
  description: "Les données ont été générées avec succès.",
  variant: 'success'
})

// 🚨 Erreur (rouge) - Erreurs et échecs
toast({
  title: "Erreur",
  description: "JSON invalide : vérifiez la syntaxe.",
  variant: 'destructive'
})

// ⚠️ Avertissement (jaune) - Actions à confirmer
toast({
  title: "Attention",
  description: "Cette action va effacer toutes les données.",
  variant: 'warning'
})

// ℹ️ Information (bleu) - Actions informatives
toast({
  title: "Copié",
  description: "JSON copié dans le presse-papiers.",
  variant: 'info'
})
```

## 🌈 Couleurs Appliquées

### Mode Clair
- **Success** : `hsl(147 19% 36%)` - Vert foncé
- **Destructive** : `hsl(9 21% 41%)` - Rouge foncé  
- **Warning** : `hsl(52 23% 34%)` - Jaune foncé
- **Info** : `hsl(217 22% 41%)` - Bleu foncé

### Mode Sombre  
- **Success** : `hsl(147 19% 64%)` - Vert clair
- **Destructive** : `hsl(9 21% 59%)` - Rouge clair
- **Warning** : `hsl(52 23% 66%)` - Jaune clair
- **Info** : `hsl(217 22% 59%)` - Bleu clair

## 📋 Bonnes Pratiques

### ✅ Quand Utiliser Chaque Variante

#### `success` - Actions Réussies
```tsx
// Validation de données
toast({ title: "JSON valide", variant: 'success' })

// Génération de données  
toast({ title: "Données générées", variant: 'success' })

// Enregistrement de fichiers
toast({ title: "Fichier sauvegardé", variant: 'success' })
```

#### `destructive` - Erreurs
```tsx
// Erreurs de validation
toast({ title: "JSON invalide", variant: 'destructive' })

// Échecs d'opération
toast({ title: "Génération échouée", variant: 'destructive' })

// Erreurs de fichier
toast({ title: "Impossible d'ouvrir le fichier", variant: 'destructive' })
```

#### `warning` - Avertissements
```tsx
// Actions potentiellement destructives
toast({ title: "Données effacées", variant: 'warning' })

// Limitations ou contraintes
toast({ title: "Fichier volumineux", variant: 'warning' })
```

#### `info` - Informations
```tsx
// Actions de copie
toast({ title: "Copié dans le presse-papiers", variant: 'info' })

// Imports/Exports
toast({ title: "Fichier importé", variant: 'info' })

// États informatifs
toast({ title: "Vérification des mises à jour", variant: 'info' })
```

## 🚫 À Éviter

```tsx
// ❌ Mauvais : Utiliser 'success' pour les erreurs
toast({ title: "Erreur JSON", variant: 'success' })

// ❌ Mauvais : Utiliser 'destructive' pour les informations
toast({ title: "Fichier copié", variant: 'destructive' })

// ❌ Mauvais : Toast trop long
toast({ 
  title: "Un titre extrêmement long qui ne rentre pas dans l'interface",
  description: "Une description encore plus longue qui va prendre trop de place...",
  variant: 'info'
})
```

## ✅ Exemples Réels du Projet

```tsx
// Generate View - Succès
toast({ 
  title: t('generate.toast.successTitle'), 
  description: t('generate.toast.successDesc'),
  variant: 'success'
})

// Generate View - Erreur JSON
toast({ 
  title: t('common.error'), 
  description: "Unexpected token 'e': 'fefef' is not valid JSON", 
  variant: 'destructive' 
})

// Validator View - Copie
toast({ 
  title: t('common.copiedTitle'), 
  description: t('generate.copyToastDesc'),
  variant: 'info'
})
```

---

**💡 Note :** Les toasts utilisent automatiquement votre palette HSL personnalisée et s'adaptent aux modes clair/sombre ! 