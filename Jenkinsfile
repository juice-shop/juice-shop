pipeline {
    agent any

    environment {
        SONAR_SCANNER_HOME = tool 'SonarQube Scanner'
        SNYK_TOKEN = credentials('snyk-token')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/dylandk0226/juice-shop.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Local') {
                    sh """
                        ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                          -Dsonar.projectKey=juice-shop \
                          -Dsonar.sources=. \
                          -Dsonar.exclusions=**/node_modules/**,**/test/** \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    """
                }
            }
        }

        stage('Snyk Security Analysis') {
            steps {
                sh '''
                    npm install -g snyk
                    snyk auth $SNYK_TOKEN
                    snyk test --all-projects --json > snyk-report.json || true
                    snyk test --all-projects || true
                '''
            }
        }

    }

    post {
        always {
            archiveArtifacts artifacts: 'snyk-report.json', allowEmptyArchive: true
            echo 'Pipeline complete.'
        }
    }
}