pipeline {

    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        SONAR_SCANNER_HOME = tool 'SonarQube Scanner'
        SNYK_TOKEN         = credentials('snyk-token')
        REPORT_DIR         = 'reports'
        IMAGE_NAME         = 'juice-shop'
        IMAGE_TAG          = "build-${BUILD_NUMBER}"
        ZAP_TARGET_URL     = 'http://juice-shop:3000'
    }

    options {
        timestamps()
        timeout(time: 150, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout SCM') {
            steps {
                echo '>>> Checking out Juice Shop source...'
                git branch: 'mary',
                    url: 'https://github.com/dylandk0226/juice-shop.git'
                sh """
                    mkdir -p ${REPORT_DIR}/sast
                    mkdir -p ${REPORT_DIR}/sca
                    mkdir -p ${REPORT_DIR}/dast
                """
            }
        }

        stage('Verify Node') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '>>> Installing dependencies...'
                sh 'npm install --ignore-scripts'
            }
        }

        /*
        ======================================================
        SAST scan only (runs scanner, pushes results to SonarQube)
        ======================================================
        */
        stage('SAST - SonarQube') {
            steps {
                echo '>>> Running SAST with SonarQube...'
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

        /*
        ======================================================
        Quality Gate — pass/fail decision based on SonarQube
        scan results. Soft gate (abortPipeline: false) so SCA
        and DAST still run for full vulnerability data.
        ======================================================
        */
        stage('Quality Gate') {
            steps {
                echo '>>> Checking SonarQube Quality Gate result...'
                script {
                    def qg
                    timeout(time: 5, unit: 'MINUTES') {
                        qg = waitForQualityGate abortPipeline: false
                    }

                    writeFile file: "${REPORT_DIR}/sast/sonar-summary.txt", text: """\
                    SonarQube SAST + Quality Gate Report
                    ====================================
                    Build:           #${env.BUILD_NUMBER}
                    Project Key:     juice-shop
                    Project Version: 19.2.1
                    Quality Gate:    ${qg?.status ?: 'UNKNOWN'}
                    Dashboard:       http://sonarqube:9000/dashboard?id=juice-shop
                    Timestamp:       ${new Date()}
                    """.stripIndent()

                    if (qg?.status != 'OK') {
                        echo "Quality Gate status: ${qg?.status} — marking build UNSTABLE"
                        currentBuild.result = 'UNSTABLE'
                    } else {
                        echo "Quality Gate PASSED"
                    }
                }
            }
        }
        /*
        ======================================================
        SCA
        ======================================================
        */

        stage('SCA - Snyk Scan') {
            steps {
                echo '>>> Running SCA with Snyk...'
                sh """
                    npm install -g snyk || npm install snyk
                    npx snyk auth \$SNYK_TOKEN

                    npx snyk test \\
                        --all-projects \\
                        --severity-threshold=low \\
                        --json > ${REPORT_DIR}/sca/snyk-report.json || true

                    npx snyk test \\
                        --all-projects \\
                        --severity-threshold=low \\
                        > ${REPORT_DIR}/sca/snyk-report.txt 2>&1 || true

                    npx snyk monitor \\
                        --all-projects \\
                        --project-name=juice-shop-jenkins-build-\${BUILD_NUMBER} \\
                        > ${REPORT_DIR}/sca/snyk-monitor.txt 2>&1 || true

                    echo "Snyk scan complete. Reports saved to ${REPORT_DIR}/sca/"
                    ls -la ${REPORT_DIR}/sca/
                """
            }
        }

        stage('Deploy to Test Env') {
            steps {
                echo '>>> Building and deploying Juice Shop container to test environment...'
                sh """
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    docker network create devsecops-net || true
                    docker rm -f juice-shop || true
                    docker run -d \\
                      --name juice-shop \\
                      --network devsecops-net \\
                      -p 3000:3000 \\
                      ${IMAGE_NAME}:${IMAGE_TAG}
                """
                sh """
                    echo '>>> Waiting for Juice Shop to be ready...'
                    for i in \$(seq 1 60); do
                        if docker run --rm --network devsecops-net curlimages/curl:8.10.1 \\
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
        ======================================================
        DAST
        ======================================================
        */

        stage('DAST - OWASP ZAP') {
            options { timeout(time: 120, unit: 'MINUTES') }
            steps {
                echo '>>> Running DAST with OWASP ZAP full scan...'
                sh """
                    docker rm -f zap-scan 2>/dev/null || true
                    docker volume rm zap-wrk 2>/dev/null || true

                    docker volume create zap-wrk
                    docker run --rm --user 0:0 -v zap-wrk:/zap/wrk alpine:latest \\
                        chmod 777 /zap/wrk

                    docker run --name zap-scan \\
                        -e ZAP_JVM_OPTIONS=-Xmx4g \\
                        --memory=6g \\
                        --network devsecops-net \\
                        -v zap-wrk:/zap/wrk \\
                        ghcr.io/zaproxy/zaproxy:stable \\
                        zap-full-scan.py \\
                            -t ${ZAP_TARGET_URL} \\
                            -r zap-report.html \\
                            -J zap-report.json \\
                            -w zap-report.md \\
                            -j \\
                        || true

                    docker cp zap-scan:/zap/wrk/zap-report.html \${WORKSPACE}/${REPORT_DIR}/dast/ || true
                    docker cp zap-scan:/zap/wrk/zap-report.json \${WORKSPACE}/${REPORT_DIR}/dast/ || true
                    docker cp zap-scan:/zap/wrk/zap-report.md   \${WORKSPACE}/${REPORT_DIR}/dast/ || true

                    docker rm zap-scan || true
                    docker volume rm zap-wrk 2>/dev/null || true

                    echo "=== Final contents of ${REPORT_DIR}/dast/ ==="
                    ls -la \${WORKSPACE}/${REPORT_DIR}/dast/

                    if [ ! -s "\${WORKSPACE}/${REPORT_DIR}/dast/zap-report.html" ]; then
                        echo "ERROR: zap-report.html is missing or empty."
                        exit 1
                    fi
                """
                echo ">>> ZAP scan complete. Report saved to ${REPORT_DIR}/dast/zap-report.html"
            }
        }
        /*
        ======================================================
        REPORT
        ======================================================
        */

        stage('Publish reports') {
            steps {
                archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports/dast',
                    reportFiles: 'zap-report.html',
                    reportName: 'OWASP ZAP DAST Report'
                ])
            }
        }
    }
    /*
    ======================================================
    POST
    ======================================================
    */

    post {
        always {
            echo '>>> Archiving scan reports...'
            archiveArtifacts artifacts: 'reports/**',
                             allowEmptyArchive: true
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
        unstable {
            echo 'Pipeline UNSTABLE — Quality Gate failed but scans completed. Check SonarQube dashboard.'
        }
        failure {
            echo 'Pipeline failed. Review Jenkins logs.'
        }
    }
}
