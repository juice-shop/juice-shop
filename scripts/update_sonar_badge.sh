#!/bin/bash
PROJECT_KEY="chenak-a_juice-shop"
sed -i "s|\[!\[Vulnerabilities\](.*)\]|\[!\[Vulnerabilities\](https://sonarcloud.io/api/project_badges/measure?project=${PROJECT_KEY}\&metric=vulnerabilities)\]|g" README.md

echo "SonarQube badges updated in README.md"
