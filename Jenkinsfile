stage('Initialize'){
    def dockerHome = tool 'myDocker'
    env.PATH = "${dockerHome}/bin:${env.PATH}"
}

pipeline {
    agent { docker { image 'node:16-alpine' } }
    stages {
        stage('build') {
            steps {
                sh 'node --version'
            }
        }
    }
}
