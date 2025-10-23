pipeline {
    agent any

    tools {
        nodejs 'node_18' // Make sure this matches your Jenkins tool config
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
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
            junit '**/test-results/**/*.xml' // Adjust if using a test reporter that outputs JUnit XML
        }
    }
}