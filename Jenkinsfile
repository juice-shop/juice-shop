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
        // Stops the pipeline if it runs longer than 60 minutes
        timeout(time: 60, unit: 'MINUTES')
        // Keeps only the last 10 builds to save disk space
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    stages {
        // Stage name: Checkout source code
        stage('Checkout SCM') {
            steps {
                echo '>>> Checking out Juice Shop source...'
                git branch: 'mary',
                    url: 'https://github.com/mdl-thdev/juice-shop.git'
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
                echo '>>> Deploying Juice Shop container to test environment...'
                sh """
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
                    for i in \$(seq 1 12); do
                        if curl -sf http://localhost:3000 > /dev/null; then
                            echo "Juice Shop is up after \$((i * 5))s"
                            break
                        fi
                        echo "Attempt \$i/12 — not ready yet, retrying in 5s..."
                        sleep 5
                    done
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

        // Runs Dynamic Application Security Testing (DAST) using OWASP ZAP
        // ZAP runs as a Docker container on the shared devsecops-net network so it can
        // reach Juice Shop at http://juice-shop:3000 without exposing ports to the host.
        // Baseline scan: crawls the app and checks for common vulnerabilities (OWASP Top 10)
        // without performing active/destructive attacks — safe to run against a live test env.
        // stage('DAST - OWASP ZAP') {
        //     steps {
        //         echo '>>> Running DAST with OWASP ZAP baseline scan...'
        //         // Pulls and runs the official ZAP stable Docker image
        //         // --network devsecops-net  : joins the shared Docker network so ZAP can resolve
        //         //                           the juice-shop hostname
        //         // -v                       : mounts the Jenkins workspace reports/ folder into
        //         //                           the ZAP container so the report is written to the host
        //         // zap-baseline.py          : ZAP's built-in passive/baseline scan script
        //         // -t                       : target URL to scan
        //         // -r                       : output HTML report filename (written to /zap/wrk inside container)
        //         // -I                       : ignore warnings — exits 0 even if alerts are found
        //         //                           so the pipeline does not fail on findings
        //         sh """
        //             docker run --rm \
        //               --network devsecops-net \
        //               -v \${WORKSPACE}/${REPORT_DIR}:/zap/wrk/:rw \
        //               ghcr.io/zaproxy/zaproxy:stable \
        //               zap-baseline.py \
        //                 -t ${ZAP_TARGET_URL} \
        //                 -r zap-report.html \
        //                 -I
        //         """
        //         echo '>>> ZAP scan complete. Report saved to ${REPORT_DIR}/zap-report.html'
        //     }
        // }

        // Publishes all scan reports (SonarQube, Snyk, OWASP Dependency-Check, ZAP)
        // as Jenkins build artifacts and HTML report pages accessible from the build page.
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

            // Tear down the Juice Shop test container after every build
            // so the next build starts with a clean slate
            // || true ensures this never fails the pipeline even if the container was already gone
            sh 'docker rm -f juice-shop || true'

            echo 'Pipeline finished.'
        }
        success {
            echo 'All stages completed. Review findings in SonarQube, Snyk, Dependency-Check, and ZAP reports.'
        }
        failure {
            echo 'Pipeline failed. Check logs above for details.'
        }
    }
}