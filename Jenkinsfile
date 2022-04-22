pipeline {
    agent any 
    tools {nodejs "nodejs"}
    stages {
        stage('Test Build Requirements') {
            steps {
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
