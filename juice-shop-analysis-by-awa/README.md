# Examen Final — Sécurité des Données (L3 Cybersécurité)

Ce dépôt contient l'audit de sécurité, les remédiations et le pipeline CI/CD réalisés dans le cadre de l'examen final du cours Sécurité des données, sur l'application OWASP Juice Shop.

## Comment exécuter le projet

1. Cloner ce dépôt : `git clone https://github.com/Awaloveh/juice-shop.git`
2. Lancer l'application via Docker : `docker run --rm -p 3000:3000 bkimminich/juice-shop`
3. Accéder à l'application : `http://localhost:3000`

## Comment lancer les analyses de sécurité

Le pipeline Jenkins (`Jenkinsfile` à la racine) exécute automatiquement :
- **SCA** : `npm audit` — analyse des dépendances vulnérables
- **SAST** : ESLint + eslint-plugin-security — analyse statique du code TypeScript (`lib/`, `routes/`)
- **Secret Detection** : Gitleaks — recherche de secrets exposés dans l'historique Git
- **DAST** : OWASP ZAP — scan dynamique de l'application en fonctionnement (exécution semi-automatisée, voir rapport)

Pour lancer le pipeline : dans Jenkins, ouvrir le job `juice-shop-security-pipeline` et cliquer sur "Lancer un build". Les rapports générés sont archivés comme artefacts de build et copiés dans `reports/`.

## Structure du dépôt

- `Jenkinsfile` — pipeline CI/CD de sécurité
- `reports/` — rapports JSON générés par les outils d'analyse
- `screenshots/` — preuves visuelles des vulnérabilités et remédiations
- `security-config/` — fichiers de configuration des outils de sécurité
- `remediation/` — fichiers de code corrigés (avant/après)

## Auteure

Awa Leye — L3 SIMAC, Université Numérique Cheikh Hamidou Kane

---