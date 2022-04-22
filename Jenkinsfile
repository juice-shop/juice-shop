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
                    snykTokenId: '9b58b1ec-d5b9-41e3-a3d9-aa698d5245f3',
                )
            }
        }
    }
}
