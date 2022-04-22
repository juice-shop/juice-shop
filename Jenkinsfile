pipeline {
    agent any 
    stages {
        stage('Test Build Requirements') {
            steps {
                sh 'cd goof/'
                sh 'npm install -g'
                sh 'npm -v'
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
