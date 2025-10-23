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
                sh 'npm test'
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
    }

    post {
        always {
            junit 'test-results/test-results.xml'
        }
    }
}