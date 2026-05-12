pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }
    // triggers {
    //     pollSCM('H/5 * * * *') // check every 5 minutes
    // }
    environment {
        // Fetches the installation path of the SonarQube Scanner configured in Jenkins and assigns it to this variable
        SONAR_SCANNER_HOME = tool 'SonarQube Scanner'
        // Pulls a secure token from Jenkins Credentials Manager (ID: snyk-token)
        SNYK_TOKEN         = credentials('snyk-token')
        // Sets a directory name where reports will be stored
        REPORT_DIR         = 'reports'
        // Docker image name and tag for the Juice Shop build
        // Built from the multi-stage Dockerfile: node:24 installer → distroless/nodejs24 runtime
        IMAGE_NAME         = 'juice-shop'
        IMAGE_TAG          = "${env.BUILD_NUMBER}"
        // Juice Shop target URL for DAST scanning — reachable via shared Docker network devsecops-net
        ZAP_TARGET_URL     = 'http://juice-shop:3000'
        // Output path for the ZAP HTML report
        ZAP_REPORT         = 'reports/zap-report.html'
    }
    // Pipeline Options
    // Configures global pipeline behavior
    options {
        // Adds timestamps to console logs
        timestamps()
        // Stops the pipeline if it runs longer than 120 minutes
        // (Bumped from 60 -> 120 to fit the full ZAP DAST scan, which can take
        //  40-55 minutes on its own. The DAST stage also has its own 90-minute
        //  timeout for safety.)
        timeout(time: 150, unit: 'MINUTES')
        // Keeps only the last 10 builds to save disk space
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    stages {
        // Stage name: Checkout source code
        stage('Checkout SCM') {
            steps {
                echo '>>> Checking out Juice Shop source...'
                git branch: 'mary',
                    url: 'https://github.com/dylandk0226/juice-shop.git'
                sh 'mkdir -p ${REPORT_DIR}' // Creates the reports directory (if it doesn't exist)
            }
        }

        stage('Verify Node'){
            steps {
                sh 'node --version' // Confirms NodeJS plugin is working correctly
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '>>> Installing dependencies (skipping postinstall to avoid Angular build)...'
                // Installs Node.js dependencies; --ignore-scripts avoids running post-install scripts (e.g., Angular build)
                sh 'npm install --ignore-scripts'
            }
        }

        // Runs Static Application Security Testing (SAST)
        stage('SAST - SonarQube Scan') {
            steps {
                echo '>>> Running SAST with SonarQube...'
                // Loads SonarQube server configuration from Jenkins
                withSonarQubeEnv('SonarQube') {
                    // Executes the SonarQube scanner
                    // Unique project identifier in SonarQube
                    // Display name in SonarQube UI
                    // Sets project version
                    // Tells SonarQube to scan the current directory
                    // Excludes node_modules, tests, compiled frontend assets, and Angular cache from scanning
                    // Points to TypeScript configuration file
                    // Provides test coverage report path
                    sh """
                        ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                          -Dsonar.projectKey=juice-shop \
                          -Dsonar.projectName='Juice Shop' \
                          -Dsonar.projectVersion=19.2.1 \
                          -Dsonar.sources=. \
                          -Dsonar.exclusions=**/node_modules/**,**/test/**,**/frontend/dist/**,**/frontend/src/assets/**,**/.angular/** \
                          -Dsonar.typescript.tsconfigPath=tsconfig.json \
                          -Dsonar.javascript.lcov.reportPaths=build/reports/coverage/server-tests/lcov.info \
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

        // Checks SonarQube quality gate result
        stage('SAST - SonarQube Analysis') {
            steps {
                echo '>>> Checking SonarQube Quality Gate result...'
                // Waits max 5 minutes; Requires a SonarQube webhook configured in SonarQube pointing back to: http://<jenkins-url>/sonarqube-webhook/
                // Without this webhook, waitForQualityGate will hang until timeout
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false  // Waits for SonarQube result
                } // abortPipeline: false → pipeline continues even if it fails
            }
        }

        // Runs OWASP Dependency-Check: scans package.json and node_modules against the
        // NVD (National Vulnerability Database) to detect known CVEs in third-party libraries.
        // Complements Snyk — Dependency-Check uses NVD CVE data while Snyk uses its own
        // advisory database, so running both gives cross-validated SCA coverage.
        // stage('SCA - OWASP Dependency-Check') {
        //     steps {
        //         echo '>>> Running SCA with OWASP Dependency-Check...'
        //         // dependency-check.sh is provided by the OWASP Dependency-Check Jenkins plugin
        //         // --project        : display name in the generated report
        //         // --scan           : path to scan (current workspace)
        //         // --exclude        : skip node_modules to avoid scanning dev tool internals
        //         // --out            : output directory for reports
        //         // --format         : generate both HTML (human-readable) and JSON (machine-readable)
        //         // --enableExperimental : enables Node.js / npm audit analyser
        //         // --nvdApiKey      : NVD API key stored in Jenkins credentials for faster CVE database updates
        //         //                   (without it, NVD throttles downloads — first run can take 20+ minutes)
        //         // || true          : prevents pipeline failure if vulnerabilities are found;
        //         //                   findings are reviewed manually in the report
        //         sh """
        //             /var/jenkins_home/tools/dependency-check/bin/dependency-check.sh \
        //               --project 'Juice Shop' \
        //               --scan . \
        //               --exclude '**/node_modules/**' \
        //               --out ${REPORT_DIR} \
        //               --format HTML \
        //               --format JSON \
        //               --enableExperimental \
        //               || true
        //         """
        //         // Archives the generated HTML report as a Jenkins build artifact
        //         // dependency-check-report.html is written to ${REPORT_DIR} by the tool
        //         echo '>>> OWASP Dependency-Check scan complete. Report saved to ${REPORT_DIR}.'
        //     }
        // }

        //Runs Software Composition Analysis (dependency vulnerability scan)
        stage('SCA - Snyk Scan') {
            steps {
                // Authenticates Snyk using stored token
                // Runs scan: Scans all projects; Only reports medium+ vulnerabilities;
                // Outputs JSON report; || true prevents pipeline failure
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
    // Defines actions after pipeline execution

    post {
        // Runs regardless of success/failure
        always {
            echo '>>> Archiving scan reports...'
            // Saves report files as Jenkins build artifacts
            // snyk-report.json is already inside ${REPORT_DIR}/ so only one glob is needed
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
        success {
            echo 'All stages completed. Review findings in SonarQube, Snyk, and ZAP reports.'
        }
        failure {
            echo 'Pipeline failed. Check logs above for details.'
        }
    }
}
