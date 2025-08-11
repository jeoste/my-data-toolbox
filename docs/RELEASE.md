# 🚀 Guide de Release Automatisé

Ce document explique comment publier automatiquement le setup.exe de JSONnymous JSON Generator sur GitHub.

## 📋 Vue d'ensemble

Le processus de release automatisé :
1. **Build** : Compile l'application Electron avec `electron-builder`
2. **Package** : Crée un installateur Windows (.exe)
3. **Release** : Publie automatiquement sur GitHub Releases
4. **Assets** : Attache le fichier setup.exe à la release

## 🔧 Configuration requise

### GitHub Repository
- Repository public ou privé avec GitHub Actions activé
- Permissions d'écriture pour les Actions (automatiquement configurées)

### Fichiers de configuration
- `.github/workflows/release-modern.yml` : Workflow principal
- `electron/package.json` : Configuration electron-builder
- `scripts/release.ps1` : Script helper pour faciliter les releases

## 🎯 Méthodes de déclenchement

### 1. CI Auto (push sur master)
Un push sur `master` déclenche automatiquement le workflow `Build and Release (Windows)`:
- Met à jour la version dans `electron/package.json` en `BASE_VERSION + run_number`
- Build le backend Python (`backend.exe`) via PyInstaller
- Build l'UI (Vite) et l’app Electron
- Publie la Release GitHub avec les assets et `latest.yml`

### 2. Via Tag Git (Optionnel)
```bash
# Créer et pousser un tag
git tag v1.0.0
git push origin v1.0.0
```

### 3. Via Script PowerShell (Optionnel)
```powershell
# Depuis la racine du projet
.\scripts\release.ps1 -Version "1.0.0" -Push
```

## 📝 Processus détaillé

### Étape 1 : Préparation
```powershell
# Vérifier l'état du repository
git status

# S'assurer d'être sur la branche principale
git checkout main
git pull origin main
```

### Étape 2 : Release avec script (Recommandé)
```powershell
# Créer une release
.\scripts\release.ps1 -Version "1.0.0" -Push
```

Le script :
- Met à jour les versions dans `package.json`
- Crée un commit de version
- Crée le tag Git
- Pousse vers GitHub
- Déclenche automatiquement le workflow

### Étape 3 : Suivi du build
### Activer/désactiver l'auto-update en production (packagé)

Par défaut, l'auto-update est activé en build packagé. Pour le désactiver (ex: canaux internes/QA), exposez :

```powershell
$Env:DISABLE_UPDATES = "true"
```

Dans GitHub Actions, configurez `DISABLE_UPDATES: true` si besoin.

1. Aller sur GitHub → Actions
2. Surveiller le workflow "Build and Release"
3. Vérifier les logs en cas d'erreur

## 🏗️ Détails du workflow

### Environnement de build
- **OS** : Windows Latest
- **Node.js** : Version 18
- **Python** : Version 3.11
- **Electron Builder** : Pour créer l'installateur

### Étapes du workflow
1. **Checkout** : Récupère le code source
2. **Setup** : Configure Node.js et Python
3. **Install** : Installe les dépendances
4. **Build** : Compile l'application Electron
5. **Verify** : Vérifie que le setup.exe est créé
6. **Release** : Crée la release GitHub
7. **Upload** : Attache le setup.exe à la release

### Artefacts produits
- `JSONnymous-Setup-{version}.exe` : Installateur Windows
- Release GitHub avec notes de version automatiques

## 📦 Structure des releases

### Nom de la release
`Release v{version}` (ex: Release v1.0.0)

### Fichiers attachés
- `JSONnymous-Setup-{version}.exe` : Installateur principal

### Description automatique
- Instructions d'installation
- Configuration requise
- Fonctionnalités principales
- Liens utiles

## 🔍 Dépannage

### Problèmes courants

#### 1. Erreur de build
```
Solution : Vérifier les logs dans GitHub Actions
- Dépendances manquantes
- Erreurs de compilation
- Problèmes de permissions
```

#### 2. Fichier setup.exe non trouvé
```
Solution : Vérifier la configuration electron-builder
- Chemin de sortie correct
- Nom du fichier généré
- Architecture cible (x64)
```

#### 3. Échec de l'upload
```
Solution : Vérifier les permissions GitHub
- GITHUB_TOKEN configuré
- Permissions d'écriture
- Taille du fichier < 2GB
```

### Logs utiles
```powershell
# Vérifier les tags locaux
git tag -l

# Vérifier les releases GitHub
gh release list

# Voir les détails d'une release
gh release view v1.0.0
```

## 🎨 Personnalisation

### Modifier la description de release
Éditer le fichier `.github/workflows/release-modern.yml` :
```yaml
body: |
  ## 🚀 Votre description personnalisée
  ### Nouveautés
  - Fonctionnalité A
  - Correction B
```

### Changer le nom du fichier
Modifier `electron/package.json` :
```json
{
  "build": {
    "win": {
      "artifactName": "MonApp-Setup-${version}.${ext}"
    }
  }
}
```

### Ajouter d'autres plateformes
Ajouter dans le workflow :
```yaml
- name: Build for macOS
  if: runner.os == 'macOS'
  run: npm run build-mac
```

## 📊 Monitoring

### Métriques importantes
- **Temps de build** : ~5-10 minutes
- **Taille du setup.exe** : ~50-100 MB
- **Taux de succès** : Viser 95%+

### Notifications
Configurer les notifications GitHub :
1. Repository Settings → Notifications
2. Actions → Workflow runs
3. Activer les notifications par email

## 🔐 Sécurité

### Bonnes pratiques
- Ne jamais exposer de tokens dans le code
- Utiliser GITHUB_TOKEN automatique
- Vérifier les permissions minimales
- Signer les exécutables en production

### Tokens requis
- `GITHUB_TOKEN` : Fourni automatiquement par GitHub
- Optionnel : Token de signature de code

## 🚀 Prochaines étapes

### Améliorations possibles
1. **Signature de code** : Signer les exécutables
2. **Tests automatiques** : Ajouter des tests avant release
3. **Multi-platform** : Support macOS et Linux
4. **Notifications** : Slack/Discord pour les releases
5. **Rollback** : Mécanisme de retour en arrière

### Intégration CI/CD
- Tests automatiques sur PR
- Builds de développement
- Déploiement automatique

---

## 📞 Support

Pour toute question sur le processus de release :
1. Consulter les logs GitHub Actions
2. Vérifier ce guide
3. Ouvrir une issue sur le repository

**Bon releasing ! 🎉** 