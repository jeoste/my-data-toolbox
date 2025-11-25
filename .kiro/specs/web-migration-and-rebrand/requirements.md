# Requirements Document

## Introduction

Ce document définit les exigences pour la migration de l'application desktop Electron "json-tools" vers une application web moderne "my-data-toolbox" déployable sur Vercel. Le projet conservera toutes les fonctionnalités existantes (génération de données JSON, anonymisation, validation, requêtes JSONPath, support Swagger/OpenAPI) tout en adoptant une architecture web full-stack.

## Glossary

- **WebApp**: L'application web my-data-toolbox qui remplace l'application Electron
- **Backend API**: Service API REST qui expose les fonctionnalités Python (génération, anonymisation)
- **Frontend**: Interface utilisateur React déployée sur Vercel
- **Python Engine**: Moteur Python existant (data_generator.py, data_anonymizer.py, etc.)
- **Vercel**: Plateforme de déploiement pour l'application web
- **User**: Utilisateur final de l'application web

## Requirements

### Requirement 1: Renommage du projet

**User Story:** En tant que mainteneur du projet, je veux renommer "json-tools" en "my-data-toolbox" dans tous les fichiers, afin de refléter la nouvelle identité du projet.

#### Acceptance Criteria

1. THE WebApp SHALL utiliser "my-data-toolbox" comme nom de package dans tous les fichiers package.json
2. THE WebApp SHALL utiliser "My Data Toolbox" comme nom d'affichage dans l'interface utilisateur
3. THE WebApp SHALL mettre à jour toutes les références "json-tools" dans les fichiers README, documentation et configuration
4. THE WebApp SHALL mettre à jour les URLs de repository GitHub vers "my-data-toolbox"
5. THE WebApp SHALL mettre à jour les métadonnées (description, keywords) pour refléter le nouveau nom

### Requirement 2: Architecture web full-stack

**User Story:** En tant qu'utilisateur, je veux accéder à l'application via un navigateur web, afin de ne pas avoir à installer une application desktop.

#### Acceptance Criteria

1. THE WebApp SHALL fournir une interface web accessible via navigateur moderne (Chrome, Firefox, Safari, Edge)
2. THE WebApp SHALL utiliser React 18+ avec TypeScript pour le frontend
3. THE WebApp SHALL exposer une API REST pour communiquer avec le backend Python
4. THE WebApp SHALL maintenir la même interface utilisateur (UI/UX) que l'application Electron existante
5. THE WebApp SHALL supporter le mode responsive pour les écrans desktop et tablette (minimum 768px de largeur)

### Requirement 3: Backend API Python

**User Story:** En tant que développeur, je veux exposer les fonctionnalités Python via une API REST, afin que le frontend web puisse les utiliser.

#### Acceptance Criteria

1. THE Backend API SHALL exposer un endpoint POST /api/generate pour la génération de données JSON
2. THE Backend API SHALL exposer un endpoint POST /api/anonymize pour l'anonymisation de données
3. THE Backend API SHALL exposer un endpoint POST /api/analyze pour l'analyse de champs sensibles
4. THE Backend API SHALL accepter les paramètres JSON (skeleton, swagger, options) dans le corps de la requête
5. THE Backend API SHALL retourner les résultats au format JSON avec codes HTTP appropriés (200, 400, 500)
6. THE Backend API SHALL gérer les erreurs et retourner des messages d'erreur explicites
7. THE Backend API SHALL utiliser Flask ou FastAPI comme framework web Python

### Requirement 4: Déploiement sur Vercel

**User Story:** En tant que mainteneur, je veux déployer l'application sur Vercel, afin qu'elle soit accessible publiquement sans infrastructure complexe.

#### Acceptance Criteria

1. THE WebApp SHALL être déployable sur Vercel via un simple `git push`
2. THE WebApp SHALL utiliser les Vercel Serverless Functions pour le backend Python
3. THE WebApp SHALL inclure un fichier vercel.json avec la configuration de déploiement
4. THE WebApp SHALL servir le frontend React en tant que site statique optimisé
5. THE WebApp SHALL supporter les variables d'environnement Vercel pour la configuration

### Requirement 5: Migration des fonctionnalités de génération

**User Story:** En tant qu'utilisateur, je veux générer des données JSON réalistes à partir d'un skeleton, afin de créer des données de test.

#### Acceptance Criteria

1. WHEN User soumet un skeleton JSON, THE WebApp SHALL générer des données réalistes en utilisant le Python Engine
2. WHERE User fournit un schéma Swagger/OpenAPI, THE WebApp SHALL appliquer les contraintes du schéma lors de la génération
3. THE WebApp SHALL permettre de spécifier le nombre d'éléments à générer pour les tableaux
4. THE WebApp SHALL permettre de définir un seed pour une génération reproductible
5. THE WebApp SHALL afficher les données générées avec formatage JSON (pretty-print)

### Requirement 6: Migration des fonctionnalités d'anonymisation

**User Story:** En tant qu'utilisateur, je veux anonymiser des données JSON sensibles, afin de protéger les informations personnelles.

#### Acceptance Criteria

1. WHEN User soumet des données JSON, THE WebApp SHALL identifier automatiquement les champs sensibles
2. THE WebApp SHALL anonymiser les champs détectés (email, téléphone, nom, adresse, etc.)
3. THE WebApp SHALL préserver la structure et les relations dans les données anonymisées
4. THE WebApp SHALL afficher un aperçu avant/après de l'anonymisation
5. THE WebApp SHALL permettre d'analyser les champs sensibles sans anonymiser

### Requirement 7: Migration des fonctionnalités de validation et JSONPath

**User Story:** En tant qu'utilisateur, je veux valider et interroger des données JSON, afin de vérifier leur conformité et extraire des informations.

#### Acceptance Criteria

1. THE WebApp SHALL valider la syntaxe JSON et afficher les erreurs de parsing
2. THE WebApp SHALL formater automatiquement le JSON (pretty-print)
3. THE WebApp SHALL permettre d'exécuter des requêtes JSONPath sur les données
4. THE WebApp SHALL afficher les résultats des requêtes JSONPath en temps réel
5. THE WebApp SHALL supporter les fonctionnalités JSONPath existantes de l'application Electron

### Requirement 8: Migration des fonctionnalités Swagger/OpenAPI

**User Story:** En tant qu'utilisateur, je veux travailler avec des schémas Swagger/OpenAPI, afin de générer des données conformes à mes APIs.

#### Acceptance Criteria

1. THE WebApp SHALL permettre d'importer un fichier Swagger/OpenAPI (YAML ou JSON)
2. THE WebApp SHALL parser et valider les schémas Swagger/OpenAPI
3. THE WebApp SHALL utiliser les contraintes Swagger lors de la génération de données
4. THE WebApp SHALL permettre de générer un skeleton à partir d'un schéma OpenAPI
5. THE WebApp SHALL permettre de convertir un exemple JSON en schéma OpenAPI

### Requirement 9: Internationalisation (i18n)

**User Story:** En tant qu'utilisateur international, je veux utiliser l'application dans ma langue, afin d'améliorer mon expérience utilisateur.

#### Acceptance Criteria

1. THE WebApp SHALL supporter les langues anglais (EN), français (FR) et coréen (KO)
2. THE WebApp SHALL détecter automatiquement la langue du navigateur
3. THE WebApp SHALL permettre de changer manuellement la langue via l'interface
4. THE WebApp SHALL traduire tous les textes de l'interface (labels, messages, tooltips)
5. THE WebApp SHALL persister le choix de langue dans le localStorage du navigateur

### Requirement 10: Thèmes visuels

**User Story:** En tant qu'utilisateur, je veux choisir entre un thème clair et sombre, afin d'adapter l'interface à mes préférences visuelles.

#### Acceptance Criteria

1. THE WebApp SHALL supporter un thème clair (light) et un thème sombre (dark)
2. THE WebApp SHALL détecter automatiquement la préférence système de l'utilisateur
3. THE WebApp SHALL permettre de basculer manuellement entre les thèmes
4. THE WebApp SHALL persister le choix de thème dans le localStorage du navigateur
5. THE WebApp SHALL appliquer le thème à tous les composants UI (shadcn/ui, Tailwind CSS)

### Requirement 11: Gestion des fichiers

**User Story:** En tant qu'utilisateur, je veux importer et exporter des fichiers JSON, afin de travailler avec mes propres données.

#### Acceptance Criteria

1. THE WebApp SHALL permettre d'importer des fichiers JSON via drag-and-drop ou sélection de fichier
2. THE WebApp SHALL permettre d'exporter les résultats générés ou anonymisés en fichier JSON
3. THE WebApp SHALL valider les fichiers importés et afficher des messages d'erreur clairs
4. THE WebApp SHALL supporter les fichiers YAML pour les schémas Swagger/OpenAPI
5. THE WebApp SHALL limiter la taille des fichiers importés à 10 MB maximum

### Requirement 12: Performance et optimisation

**User Story:** En tant qu'utilisateur, je veux que l'application soit rapide et réactive, afin d'avoir une expérience fluide.

#### Acceptance Criteria

1. THE WebApp SHALL charger l'interface initiale en moins de 3 secondes sur une connexion 4G
2. THE WebApp SHALL traiter les requêtes de génération en moins de 5 secondes pour des datasets de taille moyenne (< 1000 éléments)
3. THE WebApp SHALL afficher un indicateur de chargement pendant les opérations longues
4. THE WebApp SHALL utiliser le code splitting pour optimiser le chargement des composants
5. THE WebApp SHALL mettre en cache les ressources statiques pour améliorer les performances

### Requirement 13: Sécurité et confidentialité

**User Story:** En tant qu'utilisateur, je veux que mes données soient traitées de manière sécurisée, afin de protéger ma confidentialité.

#### Acceptance Criteria

1. THE WebApp SHALL traiter toutes les données côté client ou dans des fonctions serverless éphémères
2. THE WebApp SHALL ne pas stocker les données utilisateur sur le serveur après traitement
3. THE WebApp SHALL utiliser HTTPS pour toutes les communications
4. THE WebApp SHALL valider et sanitiser toutes les entrées utilisateur
5. THE WebApp SHALL afficher un avertissement sur la confidentialité des données sensibles

### Requirement 14: Documentation et migration

**User Story:** En tant qu'utilisateur existant, je veux comprendre les changements et comment migrer, afin de continuer à utiliser l'application efficacement.

#### Acceptance Criteria

1. THE WebApp SHALL inclure un README mis à jour avec les instructions de déploiement Vercel
2. THE WebApp SHALL documenter les différences entre la version Electron et web
3. THE WebApp SHALL fournir un guide de migration pour les utilisateurs existants
4. THE WebApp SHALL inclure des exemples d'utilisation de l'API REST
5. THE WebApp SHALL maintenir la documentation des fonctionnalités existantes
