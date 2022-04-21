pipeline {
    agent { docker { image 'node:16-alpine' } }
    stages {
    stage('Initialize'){
        def dockerHome = tool 'myDocker'
        env.PATH = "${dockerHome}/bin:${env.PATH}"
    }
    stage('build') {
            steps {
                sh 'node --version'
            }
        }
    }
}
