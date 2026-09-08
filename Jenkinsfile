pipeline {
    agent any
    stages {
        stage('1. Checkout') {
            steps {
                git url: 'https://github.com/Awaloveh/juice-shop.git', branch: 'master'
            }
        }
        stage('2. Build / Preparation') {
            steps {
                sh 'npm install || true'
            }
        }
        stage('3. Security Analysis - SAST & SCA') {
            steps {
                sh '''
                    echo "=== SCA: npm audit ==="
                    npm install --package-lock-only --ignore-scripts || true
                    npm audit --json > npm-audit-report.json || true
                    npm audit || true

                    echo "=== SAST: ESLint Security Plugin ==="
                    npm install --no-save eslint-plugin-security @typescript-eslint/parser --legacy-peer-deps || true
                    cat > eslint.security.config.mjs << 'EOF'
import security from "eslint-plugin-security";
import tsParser from "@typescript-eslint/parser";
export default [
  { ignores: [] },
  {
    files: ["lib/**/*.ts", "routes/**/*.ts"],
    languageOptions: { parser: tsParser },
    plugins: { security },
    rules: {
      "security/detect-object-injection": "warn",
      "security/detect-eval-with-expression": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-child-process": "warn",
      "security/detect-possible-timing-attacks": "warn"
    }
  }
];
EOF
                    cat > eslint-run.mjs << 'EOF'
import { ESLint } from "eslint";
import fs from "fs";
const eslint = new ESLint({ overrideConfigFile: "eslint.security.config.mjs" });
const results = await eslint.lintFiles(["lib/**/*.ts", "routes/**/*.ts"]);
fs.writeFileSync("eslint-security-report.json", JSON.stringify(results, null, 2));
const total = results.reduce((a, r) => a + r.messages.length, 0);
console.log("Total problemes detectes par ESLint Security: " + total);
EOF
                    node eslint-run.mjs || true
                '''
            }
        }
        stage('4. Additional Security Check - DAST & Secret Detection') {
            steps {
                sh '''
                    echo "=== Secret Detection: Gitleaks ==="
                    curl -sSL https://github.com/gitleaks/gitleaks/releases/download/v8.18.4/gitleaks_8.18.4_linux_x64.tar.gz -o gitleaks.tar.gz || true
                    tar -xzf gitleaks.tar.gz gitleaks || true
                    ./gitleaks detect --source . --report-path gitleaks-report.json --exit-code 0 || true

                    echo "=== DAST: OWASP ZAP (nécessite Juice Shop accessible) ==="
                    curl -sSL -o zap-baseline.py https://raw.githubusercontent.com/zaproxy/zaproxy/main/docker/zap-baseline.py || true
                    echo "ZAP scan à exécuter séparément via conteneur Docker zaproxy/zap-stable"
                '''
            }
        }
        stage('5. Report Generation') {
            steps {
                sh '''
                    mkdir -p reports
                    cp npm-audit-report.json reports/ 2>/dev/null || true
                    cp eslint-security-report.json reports/ 2>/dev/null || true
                    cp gitleaks-report.json reports/ 2>/dev/null || true
                    echo "Rapports consolidés dans le dossier reports/"
                    ls -la reports/
                '''
                archiveArtifacts artifacts: 'reports/*.json', allowEmptyArchive: true
            }
        }
        stage('6. Notification') {
            steps {
                echo 'Pipeline terminé. Vérifiez les rapports archivés.'
            }
        }
    }
    post {
        always {
            echo "Build terminé avec le statut : ${currentBuild.currentResult}"
        }
    }
}
