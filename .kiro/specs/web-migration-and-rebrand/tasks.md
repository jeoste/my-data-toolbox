# Implementation Plan

- [ ] 1. Renommer le projet de "json-tools" à "my-data-toolbox"
  - Mettre à jour package.json (root) avec le nouveau nom "my-data-toolbox"
  - Mettre à jour electron/package.json avec le nouveau nom
  - Mettre à jour toutes les références dans README.md
  - Mettre à jour les URLs GitHub dans les fichiers de configuration
  - Mettre à jour les métadonnées (description, keywords, author)
  - Mettre à jour le storageKey du ThemeProvider dans App.tsx
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Créer la structure du projet web
  - Créer la structure de dossiers pour l'application web (api/, src/, lib/, public/)
  - Créer le fichier vercel.json avec la configuration de déploiement
  - Créer un nouveau package.json à la racine pour l'application web
  - Configurer Vite pour le build de production
  - Créer le fichier .gitignore approprié pour le projet web
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.3_

- [ ] 3. Migrer le frontend React
- [ ] 3.1 Déplacer et adapter les composants React existants
  - Copier les composants depuis electron/src vers src/
  - Adapter les imports pour la nouvelle structure
  - Supprimer les dépendances Electron (window.electron, IPC)
  - Mettre à jour les chemins d'alias dans vite.config.ts
  - _Requirements: 2.2, 2.4_

- [ ] 3.2 Créer le client API REST
  - Créer src/lib/api-client.ts avec les méthodes generate, anonymize, analyze
  - Implémenter la gestion des erreurs HTTP
  - Implémenter les types TypeScript pour les requêtes/réponses
  - Créer un hook personnalisé useAPI pour simplifier les appels
  - _Requirements: 2.3, 3.1, 3.2, 3.3_

- [ ] 3.3 Adapter les vues pour utiliser l'API REST
  - Modifier GenerateView pour appeler l'API au lieu d'Electron IPC
  - Modifier AnonymizeView pour appeler l'API au lieu d'Electron IPC
  - Ajouter les états de chargement et les indicateurs visuels
  - Gérer les erreurs avec des toasts appropriés
  - _Requirements: 2.3, 5.1, 6.1, 12.3_

- [ ] 4. Créer les serverless functions Python
- [ ] 4.1 Créer la fonction /api/generate
  - Créer api/generate.py avec Flask
  - Importer et utiliser les modules Python existants (data_generator, json_processor)
  - Implémenter la validation des paramètres d'entrée
  - Implémenter la gestion des erreurs et les réponses JSON
  - Tester localement avec Vercel CLI
  - _Requirements: 3.1, 3.4, 3.5, 3.6, 5.1, 5.2, 5.3, 5.4_

- [ ] 4.2 Créer la fonction /api/anonymize
  - Créer api/anonymize.py avec Flask
  - Importer et utiliser data_anonymizer.py
  - Implémenter la validation des paramètres d'entrée
  - Implémenter la gestion des erreurs et les réponses JSON
  - Tester localement avec Vercel CLI
  - _Requirements: 3.2, 3.4, 3.5, 3.6, 6.1, 6.2, 6.3_

- [ ] 4.3 Créer la fonction /api/analyze
  - Créer api/analyze.py avec Flask
  - Utiliser data_anonymizer.get_sensitive_fields()
  - Implémenter la validation des paramètres d'entrée
  - Implémenter la gestion des erreurs et les réponses JSON
  - Tester localement avec Vercel CLI
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 6.5_

- [ ] 4.4 Créer les modules Python partagés
  - Copier src/*.py vers lib/ (data_generator, data_anonymizer, etc.)
  - Adapter les imports pour la nouvelle structure
  - Créer requirements.txt avec toutes les dépendances Python
  - Vérifier la compatibilité avec Python 3.9 (Vercel)
  - _Requirements: 3.7, 4.2_

- [ ] 5. Implémenter la gestion des fichiers
- [ ] 5.1 Implémenter l'import de fichiers
  - Ajouter un composant FileUpload avec drag-and-drop
  - Valider le type et la taille des fichiers (max 10 MB)
  - Parser les fichiers JSON et YAML
  - Afficher les erreurs de parsing de manière claire
  - _Requirements: 11.1, 11.3, 11.4, 11.5_

- [ ] 5.2 Implémenter l'export de fichiers
  - Créer une fonction utilitaire pour télécharger des fichiers JSON
  - Ajouter des boutons "Export" dans chaque vue
  - Permettre de choisir le nom du fichier exporté
  - Formater le JSON exporté (pretty-print)
  - _Requirements: 11.2, 5.5_

- [ ] 6. Migrer les fonctionnalités de validation et JSONPath
- [ ] 6.1 Implémenter la validation JSON côté client
  - Créer une fonction de validation JSON dans ValidatorView
  - Afficher les erreurs de syntaxe avec numéro de ligne
  - Implémenter le formatage automatique (pretty-print)
  - Ajouter un indicateur visuel de validation (✓ ou ✗)
  - _Requirements: 7.1, 7.2_

- [ ] 6.2 Implémenter les requêtes JSONPath côté client
  - Utiliser jsonpath-plus pour l'évaluation des requêtes
  - Implémenter l'évaluation en temps réel dans JsonPathView
  - Afficher les résultats avec formatage JSON
  - Gérer les erreurs de syntaxe JSONPath
  - _Requirements: 7.3, 7.4, 7.5_

- [ ] 7. Migrer les fonctionnalités Swagger/OpenAPI
- [ ]* 7.1 Implémenter l'import et parsing Swagger côté client
  - Créer une fonction pour parser les fichiers YAML/JSON Swagger
  - Valider le schéma Swagger/OpenAPI
  - Afficher les erreurs de validation
  - Stocker le schéma parsé dans l'état local
  - _Requirements: 8.1, 8.2_

- [ ]* 7.2 Intégrer Swagger avec la génération de données
  - Passer le schéma Swagger à l'API /api/generate
  - Adapter le backend pour utiliser les contraintes Swagger
  - Tester la génération avec différents schémas
  - _Requirements: 5.2, 8.3_

- [ ]* 7.3 Implémenter les utilitaires Swagger
  - Créer une fonction pour générer un skeleton depuis un schéma OpenAPI
  - Créer une fonction pour convertir un JSON en schéma OpenAPI
  - Ajouter ces fonctionnalités dans SwaggerView
  - _Requirements: 8.4, 8.5_

- [ ] 8. Configurer l'internationalisation (i18n)
- [ ]* 8.1 Configurer i18next
  - Installer i18next et react-i18next
  - Créer la configuration i18next avec détection de langue
  - Configurer le fallback et la persistance dans localStorage
  - Créer un hook useLanguage pour changer la langue
  - _Requirements: 9.2, 9.3, 9.5_

- [ ]* 8.2 Créer les fichiers de traduction
  - Créer src/locales/en.json avec toutes les traductions anglaises
  - Créer src/locales/fr.json avec toutes les traductions françaises
  - Créer src/locales/ko.json avec toutes les traductions coréennes
  - Organiser les traductions par namespace (common, generate, anonymize, etc.)
  - _Requirements: 9.1, 9.4_

- [ ]* 8.3 Appliquer les traductions dans l'interface
  - Remplacer tous les textes hardcodés par des appels à t()
  - Traduire les labels, boutons, messages, tooltips
  - Ajouter un sélecteur de langue dans le header
  - Tester le changement de langue en temps réel
  - _Requirements: 9.3, 9.4_

- [ ] 9. Implémenter le système de thèmes
- [ ] 9.1 Configurer le ThemeProvider
  - Adapter le ThemeProvider existant pour le web
  - Implémenter la détection de la préférence système
  - Implémenter la persistance dans localStorage
  - Créer un hook useTheme pour changer le thème
  - _Requirements: 10.2, 10.3, 10.4_

- [ ] 9.2 Appliquer les thèmes à l'interface
  - Vérifier que tous les composants shadcn/ui supportent les thèmes
  - Tester le basculement entre light et dark mode
  - Ajouter un toggle de thème dans le header
  - Vérifier le contraste et l'accessibilité
  - _Requirements: 10.1, 10.3, 10.5_

- [ ] 10. Optimiser les performances
- [ ]* 10.1 Implémenter le code splitting
  - Utiliser React.lazy() pour les vues
  - Créer des Suspense boundaries avec des loaders
  - Configurer Vite pour le chunking optimal
  - _Requirements: 12.4_

- [ ]* 10.2 Optimiser le build de production
  - Configurer la minification CSS/JS dans Vite
  - Activer la compression gzip
  - Optimiser les imports (tree shaking)
  - Analyser la taille du bundle avec vite-bundle-visualizer
  - _Requirements: 12.1, 12.5_

- [ ]* 10.3 Optimiser les serverless functions
  - Minimiser les imports Python dans chaque fonction
  - Réduire la taille des dépendances Python
  - Implémenter des timeouts appropriés
  - Tester les cold starts
  - _Requirements: 12.2_

- [ ] 11. Implémenter la sécurité
- [ ] 11.1 Sécuriser le frontend
  - Valider tous les inputs utilisateur avant envoi à l'API
  - Sanitiser les données affichées
  - Limiter la taille des fichiers importés (10 MB)
  - Ajouter un avertissement sur la confidentialité des données
  - _Requirements: 13.1, 13.4, 13.5_

- [ ] 11.2 Sécuriser le backend
  - Valider tous les payloads JSON dans les fonctions API
  - Limiter la taille des requêtes HTTP
  - Implémenter une gestion d'erreurs sécurisée (pas de détails internes)
  - Ajouter des logs pour le monitoring
  - _Requirements: 13.1, 13.2, 13.4_

- [ ] 11.3 Configurer HTTPS et headers de sécurité
  - Vérifier que Vercel utilise HTTPS par défaut
  - Configurer les headers CSP dans vercel.json
  - Configurer les headers CORS si nécessaire
  - _Requirements: 13.3_

- [ ] 12. Créer la documentation
- [ ] 12.1 Mettre à jour le README principal
  - Documenter la nouvelle architecture web
  - Ajouter les instructions de développement local
  - Ajouter les instructions de déploiement sur Vercel
  - Documenter les variables d'environnement
  - _Requirements: 14.1_

- [ ]* 12.2 Créer le guide de migration
  - Documenter les différences entre Electron et web
  - Expliquer comment migrer les workflows existants
  - Lister les fonctionnalités conservées et supprimées
  - _Requirements: 14.2, 14.3_

- [ ]* 12.3 Documenter l'API REST
  - Créer une documentation API avec exemples de requêtes/réponses
  - Documenter les codes d'erreur et leur signification
  - Ajouter des exemples cURL pour chaque endpoint
  - _Requirements: 14.4_

- [ ]* 12.4 Mettre à jour la documentation des fonctionnalités
  - Documenter l'utilisation de chaque vue (Generate, Anonymize, etc.)
  - Ajouter des captures d'écran de l'interface web
  - Créer un guide de démarrage rapide
  - _Requirements: 14.5_

- [ ] 13. Tester et déployer
- [ ] 13.1 Tester localement
  - Tester toutes les fonctionnalités en mode développement
  - Tester avec Vercel CLI (vercel dev)
  - Vérifier les performances et les temps de réponse
  - Tester sur différents navigateurs (Chrome, Firefox, Safari, Edge)
  - _Requirements: 2.1, 12.1, 12.2_

- [ ] 13.2 Déployer sur Vercel
  - Connecter le repository GitHub à Vercel
  - Configurer les variables d'environnement
  - Déployer en preview pour validation
  - Déployer en production
  - _Requirements: 4.1, 4.4_

- [ ] 13.3 Vérifier le déploiement
  - Tester toutes les fonctionnalités en production
  - Vérifier les logs Vercel pour les erreurs
  - Tester les performances en production
  - Vérifier que HTTPS fonctionne correctement
  - _Requirements: 4.1, 13.3_

- [ ]* 14. Nettoyer le code Electron (optionnel)
  - Archiver ou supprimer le dossier electron/
  - Supprimer les scripts Electron du package.json root
  - Mettre à jour .gitignore pour exclure les fichiers Electron
  - Créer une branche git pour conserver l'ancienne version Electron
  - _Requirements: 2.1_
