pipeline {
    // Tells Jenkins to run this pipeline on any available agent/node
    agent any

    // Defines environment variables accessible throughout the pipeline
    environment {
        // Fetches the installation path of the SonarQube Scanner configured in Jenkins and assigns it to this variable
        SONAR_SCANNER_HOME = tool 'SonarQube Scanner'
        // Pulls a secure token from Jenkins Credentials Manager (ID: snyk-token)
        SNYK_TOKEN         = credentials('snyk-token')
        // Sets a directory name where reports will be stored
        REPORT_DIR         = 'reports'
    }
    // Pipeline Options
    // Configures global pipeline behavior
    options {
        // Adds timestamps to console logs
        timestamps()
        // Stops the pipeline if it runs longer than 60 minutes
        timeout(time: 60, unit: 'MINUTES')
        // Keeps only the last 10 builds to save disk space
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    // Defines the sequence of steps (stages) in the pipeline
    stages {

        // Stage name: Checkout source code
        stage('Checkout') {
            // Contains the actual commands
            steps {
                // Prints a message to the console
                echo '>>> Checking out Juice Shop source...'
                // Clones the GitHub repository (main branch)
                git branch: 'mary',
                    url: 'https://github.com/dylandk0226/juice-shop.git'
                // Creates the reports directory (if it doesn’t exist)
                sh 'mkdir -p ${REPORT_DIR}'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Logs what’s happening
                echo '>>> Installing dependencies (skipping postinstall to avoid Angular build)...'
                // Installs Node.js dependencies
                // --ignore-scripts avoids running post-install scripts (e.g., Angular build)
                sh 'npm install --ignore-scripts'
            }
        }
        // Runs Static Application Security Testing (SAST)
        stage('SAST - SonarQube Scan') {
            steps {
                echo '>>> Running SAST with SonarQube...'
                // Loads SonarQube server configuration from Jenkins (must match configured name)
                withSonarQubeEnv('SonarQube-Local') {
                    // Runs a multi-line shell script
                    // Executes the SonarQube scanner
                    // Unique project identifier in SonarQube
                    // Display name in SonarQube UI
                    // Sets project version
                    // Tells SonarQube to scan the current directory
                    // Excludes folders/files (node_modules, tests, frontend, etc.) from scanning
                    // Points to TypeScript configuration file
                    // Provides test coverage report path
                    // Sets encoding
                    sh """
                        ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                          -Dsonar.projectKey=juice-shop \
                          -Dsonar.projectName='Juice Shop' \
                          -Dsonar.projectVersion=19.2.1 \
                          -Dsonar.sources=. \
                          -Dsonar.exclusions=\
                          -Dsonar.typescript.tsconfigPath=tsconfig.json \
                          -Dsonar.javascript.lcov.reportPaths=build/reports/coverage/server-tests/lcov.info \
                          -Dsonar.sourceEncoding=UTF-8
                    """
                } // Ends shell script // Ends SonarQube environment block
            }
        }

        // Checks SonarQube quality gate result
        stage('SAST - Quality Gate') {
            steps {
                echo '>>> Checking SonarQube Quality Gate result...'
                // Waits max 5 minutes
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false  // Waits for SonarQube result
                } // abortPipeline: false → pipeline continues even if it fails
            }
        }
        // Runs Software Composition Analysis (dependency vulnerability scan)
        stage('SCA - Snyk Scan') {
            steps {
                // Authenticates Snyk using stored token
                // Runs scan: Scans all projects; Only reports medium+ vulnerabilities; 
                // ; Outputs JSON report; || true prevents pipeline failure
                echo '>>> Running SCA with Snyk...'
                sh """
                    snyk auth \$SNYK_TOKEN

                    snyk test \
                        --all-projects \
                        --severity-threshold=medium \
                        --json > ${REPORT_DIR}/snyk-report.json || true

                    snyk test \
                        --all-projects \
                        --severity-threshold=medium || true

                    echo "Snyk scan complete."
                """
            } // Runs again for human-readable console output
        }
    }
    // Defines actions after pipeline execution

    post {
        // Runs regardless of success/failure
        always {
            echo '>>> Archiving scan reports...'
            // Saves report files as Jenkins build artifacts
            archiveArtifacts artifacts: "${REPORT_DIR}/**,snyk-report.json",
                             allowEmptyArchive: true

            echo 'Pipeline finished.'
        }
        // Runs only if pipeline succeeds

        success {
            echo 'All stages completed. Review findings in SonarQube and Snyk reports.'
        }
        // Runs only if pipeline fails

        failure {
            echo 'Pipeline failed. Check logs above for details.'
        }
    }
}