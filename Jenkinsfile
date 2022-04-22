pipeline {
    agent any 
    stages {
        stage('Build') {
            steps {
                echo 'Building ...'
            }
        }
        stage('Download Latest Snyk CLI') {
            steps {
                sh(script: 'curl -Is "https://github.com/snyk/cli/releases/download/v1.910.0/snyk-linux" | grep "^location" | sed s#.*tag/##g', returnStdout: true)
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                snykSecurity(
                    snykInstallation: 'mySnyk',
                    snykTokenId: 'jenkins-pickford-snyk',
                )
            }
        }
    }
}
