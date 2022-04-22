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
                    snykTokenId: '3b474d91-24cc-440f-8623-39b1c5044988',
                )
            }
        }
    }
}
