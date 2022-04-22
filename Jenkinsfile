pipeline {
    agent any 
    stages {
        stage('Build') {
            steps {
                echo 'Building ...'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                snykSecurity(
                    snykInstallation: 'mySnyk',
                    snykTokenId: 'pickford-snyk',
                )
            }
        }
    }
}
