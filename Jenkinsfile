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
        // Stops the pipeline if it runs longer than 120 minutes
        // (Bumped from 60 -> 120 to fit the full ZAP DAST scan, which can take
        //  40-55 minutes on its own. The DAST stage also has its own 90-minute
        //  timeout for safety.)
        timeout(time: 150, unit: 'MINUTES')
        // Keeps only the last 10 builds to save disk space

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
                    url: 'https://github.com/dylandk0226/juice-shop.git'

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
            }
        }

        stage('Deploy to Test Env') {
            steps {
                echo '>>> Building and deploying Juice Shop container to test environment...'
                sh """
                    # Build the Docker image from the checked-out source first.
                    # Without this, the docker run below would fail because the
                    # juice-shop:${IMAGE_TAG} image would not yet exist.
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

                    # Ensure the shared network exists (idempotent — || true if already there)
                    docker network create devsecops-net || true

                    # Stop and remove any existing juice-shop container from a previous build
                    docker rm -f juice-shop || true

                    # Run Juice Shop on devsecops-net so ZAP can reach it by hostname
                    # -d           : detached (background)
                    # --name       : container name — used as DNS hostname on the Docker network
                    # --network    : shared network with Jenkins and ZAP containers
                    # -p 3000:3000 : also expose on host for manual verification in browser
                    docker run -d \
                      --name juice-shop \
                      --network devsecops-net \
                      -p 3000:3000 \
                      ${IMAGE_NAME}:${IMAGE_TAG}
                """

                sh """
                    echo '>>> Waiting for Juice Shop to be ready...'
                    for i in \$(seq 1 60); do
                        if docker run --rm --network devsecops-net curlimages/curl:8.10.1 \
                             -sf http://juice-shop:3000 >/dev/null 2>&1; then
                            echo "Juice Shop is up after \$((i * 3))s"
                            exit 0
                        fi
                        echo "Attempt \$i/60 — not ready yet, retrying in 3s..."
                        sleep 3
                    done
                    echo "Juice Shop never came up — last 50 lines of container logs:"
                    docker logs --tail 50 juice-shop || true
                    exit 1
                """
                echo '>>> Juice Shop deployed at http://juice-shop:3000 (internal) and http://localhost:3000 (host)'
            }
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

        stage('DAST - OWASP ZAP') {
            options { timeout(time: 120, unit: 'MINUTES') }
            steps {
                echo '>>> Running DAST with OWASP ZAP full scan...'
                sh """
                    docker rm -f zap-scan 2>/dev/null || true
                    docker volume rm zap-wrk 2>/dev/null || true

                    docker volume create zap-wrk
                    docker run --rm --user 0:0 -v zap-wrk:/zap/wrk alpine:latest \
                        chmod 777 /zap/wrk

                    docker run --name zap-scan \
                        -e ZAP_JVM_OPTIONS=-Xmx4g \
                        --memory=6g \
                        --network devsecops-net \
                        -v zap-wrk:/zap/wrk \
                        ghcr.io/zaproxy/zaproxy:stable \
                        zap-full-scan.py \
                            -t ${ZAP_TARGET_URL} \
                            -r zap-report.html \
                            -J zap-report.json \
                            -w zap-report.md \
                            -j \
                        || true

                    docker cp zap-scan:/zap/wrk/zap-report.html \${WORKSPACE}/${REPORT_DIR}/ || true
                    docker cp zap-scan:/zap/wrk/zap-report.json \${WORKSPACE}/${REPORT_DIR}/ || true
                    docker cp zap-scan:/zap/wrk/zap-report.md  \${WORKSPACE}/${REPORT_DIR}/ || true

                    docker rm zap-scan || true
                    docker volume rm zap-wrk 2>/dev/null || true

                    echo "=== Final contents of ${REPORT_DIR}/ ==="
                    ls -la \${WORKSPACE}/${REPORT_DIR}/

                    if [ ! -s "\${WORKSPACE}/${REPORT_DIR}/zap-report.html" ]; then
                        echo "ERROR: zap-report.html is missing or empty."
                        echo "Likely cause: ZAP crashed before report generation."
                        echo "Check ZAP_JVM_OPTIONS and stage console for OOM."
                        exit 1
                    fi
                """
                echo '>>> ZAP scan complete. Report saved to ${REPORT_DIR}/zap-report.html'
            }
        }

        // Publishes the ZAP HTML report so it appears as a clickable link in
        // the Jenkins build sidebar. The reports are also archived as build
        // artifacts by the post-always block below for download.
        stage('Publish reports') {
            steps {
                archiveArtifacts artifacts: 'reports/*', allowEmptyArchive: true
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports',
                    reportFiles: 'zap-report.html',
                    reportName: 'OWASP ZAP DAST Report'
                ])
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

            // Tear down the test containers and ZAP volume after every build
            // so the next build starts with a clean slate.
            // Cleans up both juice-shop (Mary's naming) and juice-shop-staging
            // (the alternate naming used by the standalone DAST pipeline) so
            // this post block is safe for either pipeline variant.
            // 2>/dev/null silences "no such container/volume" noise.
            // || true ensures this never fails the pipeline even if the resource was already gone.
            sh '''
                docker rm -f juice-shop 2>/dev/null || true
                docker rm -f juice-shop-staging 2>/dev/null || true
                docker rm -f zap-scan 2>/dev/null || true
                docker volume rm zap-wrk 2>/dev/null || true
            '''

            echo "Build #${env.BUILD_NUMBER} finished with status: ${currentBuild.currentResult}"
        }

        // Runs if pipeline succeeds
        success {
            echo 'All stages completed. Review findings in SonarQube, Snyk, and ZAP reports.'
        }

        // Runs if pipeline fails
        failure {
            echo 'Pipeline failed. Review Jenkins logs.'
        }
    }
}
