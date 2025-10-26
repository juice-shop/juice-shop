pipeline {
    agent any

    environment {
        CHROME_BIN = '/usr/bin/google-chrome' // Adjust path if needed
    }

    tools {
        nodejs 'node_18'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Chrome') {
            steps {
                sh '''
                    if ! command -v google-chrome > /dev/null; then
                      echo "Installing Google Chrome..."
                      wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
                      sudo apt-get update
                      sudo apt-get install -y ./google-chrome-stable_current_amd64.deb
                    else
                      echo "Google Chrome already installed."
                    fi
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'rm -rf node_modules package-lock.json'
                sh 'npm install'
                sh 'cd frontend && npm install --save-dev karma-junit-reporter --legacy-peer-deps'
                sh 'npm uninstall libxmljs2'
                sh 'npm install libxmljs2'
                sh 'npm rebuild'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'cd frontend && npm run test -- --watch=false --source-map=true'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build:frontend'
                sh 'npm run build:server'
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: '**/dist/**', fingerprint: true
            }
        }

        stage('Check Chrome') {
            steps {
                sh 'google-chrome --version || chromium-browser --version || echo "Chrome not installed"'
            }
        }

        stage('Verify Test Report') {
            steps {
                sh 'find . -name "test-results.xml" || echo "No test-results.xml found"'
            }
        }

        stage('Aqua scanner') {
            agent {
                docker {
                    image 'aquasec/aqua-scanner'
                    args '-u root:root'
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'AQUA_KEY_DEV_123', variable: 'AQUA_KEY'),
                    string(credentialsId: 'AQUA_SECRET_DEV_123', variable: 'AQUA_SECRET'),
                    string(credentialsId: 'GITHUB_TOKEN_DEV_123', variable: 'GITHUB_TOKEN')
                ]) {
                    sh '''
                        export TRIVY_RUN_AS_PLUGIN=aqua
                        export AQUA_URL=https://api.dev.supply-chain.cloud.aquasec.com
                        export CSPM_URL=https://stage.api.cloudsploit.com
                        trivy fs --scanners misconfig,vuln,secret .
                    '''
                }
            }
        }
    }

    post {
        always {
            junit testResults: 'frontend/test-results/test-results.xml', allowEmptyResults: true
        }
    }
}