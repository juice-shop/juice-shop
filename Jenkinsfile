pipeline {
    agent any 
    stages {
        stage('Test Build Requirements') {
            sh 'cd goof/'
            sh 'npm install -g'
            sh 'npm -v'
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
