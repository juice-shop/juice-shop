pipeline {

    // Run on any available Jenkins agent/node
    agent any

    // Jenkins-managed tools that must already be configured
    tools {
        nodejs 'NodeJS'
    }

    /*
    Optional trigger:
    Polls Git repository every 5 minutes for changes
    */
    // triggers {
    //     pollSCM('H/5 * * * *')
    // }

    // Environment variables available throughout the pipeline
    environment {

        // Path to SonarQube Scanner configured in Jenkins
        SONAR_SCANNER_HOME = tool 'SonarQube Scanner'

        // Securely loads Snyk API token from Jenkins credentials
        SNYK_TOKEN = credentials('snyk-token')

        // Folder used to store reports
        REPORT_DIR = 'reports'
    }

    // Global pipeline settings
    options {

        // Add timestamps to Jenkins logs
        timestamps()

        // Abort build after 60 minutes
        timeout(time: 60, unit: 'MINUTES')

        // Keep only the latest 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        /*
        ======================================================
        Stage 1: Pull source code from GitHub
        ======================================================
        */
        stage('Checkout SCM') {
            steps {

                echo '>>> Checking out Juice Shop source...'

                // Clone specific branch from GitHub repository
                git branch: 'mary',
                    url: 'https://github.com/mdl-thdev/juice-shop.git'

                // Create reports directory if missing
                sh "mkdir -p ${REPORT_DIR}"
            }
        }

        /*
        ======================================================
        Stage 2: Verify Node.js installation
        ======================================================
        */
        stage('Verify Node') {
            steps {

                // Check Node.js version
                sh 'node --version'

                // Check npm version
                sh 'npm --version'
            }
        }

        /*
        ======================================================
        Stage 3: Install project dependencies
        ======================================================
        */
        stage('Install Dependencies') {
            steps {

                echo '>>> Installing dependencies...'

                /*
                Installs dependencies from package.json

                --ignore-scripts prevents execution of
                postinstall scripts (helpful to avoid
                Angular frontend builds during scanning)
                */
                sh 'npm install --ignore-scripts'
            }
        }

        /*
        ======================================================
        Stage 4: Static Application Security Testing (SAST)
        Using SonarQube
        ======================================================
        */
        stage('SAST - SonarQube') {
            steps {

                echo '>>> Running SAST with SonarQube...'

                /*
                Injects SonarQube server configuration
                and authentication into environment
                */
                withSonarQubeEnv('SonarQube') {

                    sh """
                        ${SONAR_SCANNER_HOME}/bin/sonar-scanner \\
                          -Dsonar.projectKey=juice-shop \\
                          -Dsonar.projectName='Juice Shop' \\
                          -Dsonar.projectVersion=19.2.1 \\
                          -Dsonar.sources=. \\
                          -Dsonar.exclusions=**/node_modules/**,**/test/**,**/frontend/dist/**,**/frontend/src/assets/**,**/.angular/** \\
                          -Dsonar.typescript.tsconfigPath=tsconfig.json \\
                          -Dsonar.javascript.lcov.reportPaths=build/reports/coverage/server-tests/lcov.info \\
                          -Dsonar.sourceEncoding=UTF-8
                    """
                }

                /*
                Waits for SonarQube Quality Gate result

                abortPipeline: false means the build
                continues even if quality gate fails
                */
                echo '>>> Checking SonarQube Quality Gate result...'

                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }

        /*
        ======================================================
        Stage 5: Software Composition Analysis (SCA)
        Using Snyk (installed via npm)
        ======================================================
        */
        stage('SCA - Snyk Scan') {
            steps {

                echo '>>> Running SCA with Snyk...'

                sh """
                    # Install Snyk CLI via npm (npm comes from the NodeJS tool)
                    # Try global install first; fall back to local install if permissions block it
                    npm install -g snyk || npm install snyk

                    # Authenticate with Snyk using token from Jenkins credentials
                    npx snyk auth \$SNYK_TOKEN

                    # Run dependency vulnerability scan and output JSON report
                    # --all-projects: detects all supported manifests
                    # --severity-threshold=low: includes findings from low severity upward
                    # || true: stage continues even if vulnerabilities are found
                    npx snyk test \\
                        --all-projects \\
                        --severity-threshold=low \\
                        --json > ${REPORT_DIR}/snyk-report.json || true

                    # Run again for human-readable console output
                    npx snyk test \\
                        --all-projects \\
                        --severity-threshold=low || true

                    # Push snapshot to Snyk web console so it shows on app.snyk.io
                    # Each build creates a new monitored snapshot with build metadata
                    npx snyk monitor \\
                    --all-projects \\
                    --project-name=juice-shop-jenkins-build-\${BUILD_NUMBER} || true

                    echo "Snyk scan complete."
                """
            }
        }
    }

    /*
    ======================================================
    Post-build actions
    ======================================================
    */
    post {

        // Always runs regardless of build result
        always {

            echo '>>> Archiving scan reports...'

            /*
            Stores reports as Jenkins build artifacts
            */
            archiveArtifacts artifacts: 'reports/**',
                             allowEmptyArchive: true

            echo 'Pipeline finished.'
        }

        // Runs if pipeline succeeds
        success {
            echo 'All stages completed successfully.'
        }

        // Runs if pipeline fails
        failure {
            echo 'Pipeline failed. Review Jenkins logs.'
        }
    }
}
