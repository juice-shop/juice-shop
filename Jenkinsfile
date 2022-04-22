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
                npm install
		snykSecurity(
                    snykInstallation: 'mySnyk',
                    snykTokenId: 'jenkins-pickford-snyk',
                )
            }
        }
    }
}
