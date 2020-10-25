pipeline {
    agent {
        docker {
            image 'node:6-alpine' 
            args '-p 3000:3000' 
        }
    }
    stages {
        stage('build') {
        steps {
            sh 'npm install'
            sh 'npm run build'
        }
        }

        stage('test') {
        steps {
            sh 'npm run test'
        }
        }
    }
}