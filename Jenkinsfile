pipeline {

    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {

        // SonarQube Scanner configured in Jenkins
        SONAR_SCANNER_HOME = tool 'SonarQube Scanner'

        // Jenkins credentials
        SNYK_TOKEN = credentials('snyk-token')

        // Reports folder
        REPORT_DIR = 'reports'

        // Docker image config
        IMAGE_NAME = 'juice-shop'
        IMAGE_TAG = "${BUILD_NUMBER}"

        // OWASP ZAP target
        ZAP_TARGET_URL = 'http://juice-shop:3000'
    }

    options {

        timestamps()

        timeout(time: 150, unit: 'MINUTES')

        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        /*
        ======================================================
        Stage 1: Checkout Source Code
        ======================================================
        */
        stage('Checkout SCM') {
            steps {

                echo '>>> Checking out Juice Shop source...'

                git branch: 'mary',
                    url: 'https://github.com/dylandk0226/juice-shop.git'

                sh "mkdir -p ${REPORT_DIR}"
            }
        }

        /*
        ======================================================
        Stage 2: Verify Node.js
        ======================================================
        */
        stage('Verify Node') {
            steps {

                sh 'node --version'

                sh 'npm --version'
            }
        }

        /*
        ======================================================
        Stage 3: Install Dependencies
        ======================================================
        */
        stage('Install Dependencies') {
            steps {

                echo '>>> Installing dependencies...'

                sh 'npm install --ignore-scripts'
            }
        }

        /*
        ======================================================
        Stage 4: SAST - SonarQube
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

                    echo "SonarQube Dashboard:"
                    echo "${SONAR_HOST_URL}/dashboard?id=juice-shop"
                }
            }
        }

        /*
        ======================================================
        Stage 5: SonarQube Quality Gate
        ======================================================
        */
        stage('Quality Gate') {
            steps {

                echo '>>> Waiting for SonarQube Quality Gate...'

                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }

        /*
        ======================================================
        Stage 6: Deploy to Test Environment
        ======================================================
        */
        stage('Deploy to Test Env') {
            steps {

                echo '>>> Building and deploying Juice Shop...'

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
                    echo '>>> Waiting for Juice Shop to start...'

                    for i in \$(seq 1 60); do

                        if docker run --rm --network devsecops-net curlimages/curl:8.10.1 \\
                             -sf http://juice-shop:3000 >/dev/null 2>&1; then

                            echo "Juice Shop is ready after \$((i * 3)) seconds"
                            exit 0
                        fi

                        echo "Attempt \$i/60 — retrying in 3 seconds..."
                        sleep 3
                    done

                    echo "Juice Shop failed to start."
                    docker logs --tail 50 juice-shop || true
                    exit 1
                """
            }
        }

        /*
        ======================================================
        Stage 7: SCA - Snyk
        ======================================================
        */
        stage('SCA - Snyk Scan') {
            steps {

                echo '>>> Running SCA with Snyk...'

                sh """
                    npm install -g snyk snyk-to-html || npm install snyk snyk-to-html

                    npx snyk auth \$SNYK_TOKEN

                    npx snyk test \\
                        --all-projects \\
                        --severity-threshold=low \\
                        --json > ${REPORT_DIR}/snyk-report.json || true

                    npx snyk-to-html \\
                        -i ${REPORT_DIR}/snyk-report.json \\
                        -o ${REPORT_DIR}/snyk-report.html || true

                    npx snyk test \\
                        --all-projects \\
                        --severity-threshold=low || true

                    npx snyk monitor \\
                        --all-projects \\
                        --project-name=juice-shop-jenkins-build-\${BUILD_NUMBER} || true

                    echo "Snyk scan completed."
                """
            }
        }

        /*
        ======================================================
        Stage 8: DAST - OWASP ZAP
        ======================================================
        */
        stage('DAST - OWASP ZAP') {

            options {
                timeout(time: 120, unit: 'MINUTES')
            }

            steps {

                echo '>>> Running OWASP ZAP full scan...'

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

                    docker cp zap-scan:/zap/wrk/zap-report.html \${WORKSPACE}/${REPORT_DIR}/ || true
                    docker cp zap-scan:/zap/wrk/zap-report.json \${WORKSPACE}/${REPORT_DIR}/ || true
                    docker cp zap-scan:/zap/wrk/zap-report.md \${WORKSPACE}/${REPORT_DIR}/ || true

                    docker rm zap-scan || true
                    docker volume rm zap-wrk 2>/dev/null || true

                    ls -la \${WORKSPACE}/${REPORT_DIR}/

                    if [ ! -s "\${WORKSPACE}/${REPORT_DIR}/zap-report.html" ]; then
                        echo "ERROR: zap-report.html missing."
                        exit 1
                    fi
                """
            }
        }

        /*
        ======================================================
        Stage 9: Publish All Reports
        ======================================================
        */
        stage('Publish Reports') {
            steps {

                echo '>>> Publishing reports...'

                archiveArtifacts artifacts: 'reports/**',
                                 allowEmptyArchive: true

                // Publish Snyk HTML Report
                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports',
                    reportFiles: 'snyk-report.html',
                    reportName: 'Snyk SCA Report'
                ])

                // Publish ZAP HTML Report
                publishHTML(target: [
                    allowMissing: true,
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
    Post Build Actions
    ======================================================
    */
    post {

        always {

            echo '>>> Cleaning up Docker resources...'

            archiveArtifacts artifacts: 'reports/**',
                             allowEmptyArchive: true

            sh '''
                docker rm -f juice-shop 2>/dev/null || true
                docker rm -f zap-scan 2>/dev/null || true
                docker volume rm zap-wrk 2>/dev/null || true
            '''

            echo "Build #${env.BUILD_NUMBER} finished with status: ${currentBuild.currentResult}"
        }

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Review Jenkins logs and published reports.'
        }
    }
}