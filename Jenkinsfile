pipeline {
    // Tells Jenkins to run this pipeline on any available agent/node
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    // Defines environment variables accessible throughout the pipeline
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
        IMAGE_TAG          = '19.2.1'
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
                // Creates the reports directory (if it doesn't exist)
                sh 'mkdir -p ${REPORT_DIR}'
            }
        }

        stage('Verify Node'){
            steps {
                // Confirms NodeJS plugin is working correctly
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Logs what's happening
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
                withSonarQubeEnv('SonarQube') {
                    // Runs a multi-line shell script
                    // Executes the SonarQube scanner
                    // Unique project identifier in SonarQube
                    // Display name in SonarQube UI
                    // Sets project version
                    // Tells SonarQube to scan the current directory
                    // Excludes node_modules, tests, compiled frontend assets, and Angular cache from scanning
                    // Points to TypeScript configuration file
                    // Provides test coverage report path
                    // Sets encoding
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
                } // Ends shell script // Ends SonarQube environment block
            }
        }

        // Builds the Juice Shop Docker image from the project's multi-stage Dockerfile
        // Stage 1 (installer): node:24 — installs prod dependencies, generates SBOM via CycloneDX
        // Stage 2 (runtime):   distroless/nodejs24-debian13 — minimal attack surface, no shell
        // BUILD_DATE and VCS_REF are passed as build args to populate OCI image labels
        // (matches the ARG declarations in the Dockerfile)
        stage('Build Docker Image') {
            steps {
                echo '>>> Building Juice Shop Docker image from source...'
                sh """
                    docker build \
                      --build-arg BUILD_DATE=\$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
                      --build-arg VCS_REF=\$(git rev-parse --short HEAD) \
                      -t ${IMAGE_NAME}:${IMAGE_TAG} \
                      -t ${IMAGE_NAME}:latest \
                      .
                """
                // Confirm the image was built and is available in the local Docker daemon
                sh "docker images ${IMAGE_NAME}"
                echo '>>> Docker image built successfully: ${IMAGE_NAME}:${IMAGE_TAG}'
            }
        }

        // Deploys the freshly built Juice Shop image as a Docker container on the shared
        // devsecops-net network so OWASP ZAP can reach it at http://juice-shop:3000
        // Any existing container with the same name is stopped and removed first to avoid
        // conflicts on re-runs (docker rm -f exits 0 even if the container doesn't exist)
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
                // Wait for Juice Shop to finish booting before handing off to DAST
                // Juice Shop is a Node.js app — it typically starts within 15-20 seconds
                // curl -f fails silently if the app isn't ready yet; retry loop gives it 60s
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
        stage('SAST - Quality Gate') {
            steps {
                echo '>>> Checking SonarQube Quality Gate result...'
                // Waits max 5 minutes
                // IMPORTANT: Requires a SonarQube webhook configured in SonarQube pointing back to:
                // http://<jenkins-url>/sonarqube-webhook/
                // Without this webhook, waitForQualityGate will hang until timeout
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false  // Waits for SonarQube result
                } // abortPipeline: false → pipeline continues even if it fails
            }
        }

        // Brings up the full devsecops-net environment using docker-compose.yml
        // This ensures Jenkins, SonarQube, and Juice Shop are all running and networked
        // together before the SCA and DAST stages execute.
        // docker compose up -d   : starts all services defined in docker-compose.yml in detached mode
        // --no-recreate          : skips recreating containers that are already running
        //                          (avoids restarting Jenkins mid-pipeline)
        // juice-shop is defined in docker-compose.yml as bkimminich/juice-shop (pre-built image)
        // but at this point in the pipeline we have already deployed our custom-built image above,
        // so this stage is used to ensure SonarQube and any other compose services are healthy
        stage('Docker Compose') {
            steps {
                echo '>>> Ensuring all compose services are up via docker-compose...'
                sh """
                    docker compose up -d --no-recreate

                    # Give services a moment to reach healthy state before proceeding
                    sleep 10

                    # Print running containers so the build log shows what is up
                    docker compose ps
                """
                echo '>>> All docker-compose services are running.'
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

        // Runs Software Composition Analysis (dependency vulnerability scan)
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
        stage('Publish Reports') {
            steps {
                echo '>>> Publishing all security scan reports...'
                // Archives every file in the reports/ directory as a downloadable build artifact
                // allowEmptyArchive: true — won't fail if a scan was skipped and produced no output
                archiveArtifacts artifacts: "${REPORT_DIR}/**",
                                 allowEmptyArchive: true

                // Publishes the OWASP Dependency-Check HTML report as a navigable Jenkins page
                // reportName : label shown on the build sidebar
                // reportDir  : folder containing the report file
                // reportFiles: entry point HTML file
                // publishHTML(target: [
                //     reportName : 'OWASP Dependency-Check Report',
                //     reportDir  : "${REPORT_DIR}",
                //     reportFiles: 'dependency-check-report.html',
                //     alwaysLinkToLastBuild: true,
                //     keepAll    : true
                // ])

                // // Publishes the OWASP ZAP HTML report as a navigable Jenkins page
                // publishHTML(target: [
                //     reportName : 'OWASP ZAP Report',
                //     reportDir  : "${REPORT_DIR}",
                //     reportFiles: 'zap-report.html',
                //     alwaysLinkToLastBuild: true,
                //     keepAll    : true
                // ])

                echo '>>> All reports published. Check the build sidebar for HTML report links.'
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
            archiveArtifacts artifacts: "${REPORT_DIR}/**",
                             allowEmptyArchive: true

            // Tear down the Juice Shop test container after every build
            // so the next build starts with a clean slate
            // || true ensures this never fails the pipeline even if the container was already gone
            sh 'docker rm -f juice-shop || true'

            echo 'Pipeline finished.'
        }
        // Runs only if pipeline succeeds
        success {
            echo 'All stages completed. Review findings in SonarQube, Snyk, Dependency-Check, and ZAP reports.'
        }
        // Runs only if pipeline fails
        failure {
            echo 'Pipeline failed. Check logs above for details.'
        }
    }
}