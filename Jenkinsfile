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
                latest_version = sh(script: 'curl -Is "https://github.com/snyk/snyk/releases/latest" | grep "^location" | sed s#.*tag/##g', returnStdout: true)
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
