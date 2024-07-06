stages {
    stage('Install Cimon') {
        steps {
            sh 'curl -sSfL https://cimon-releases.s3.amazonaws.com/install.sh | sudo sh -s -- -b /usr/local/bin'
        }
    }

    stage('Run Cimon') {
        environment {
            CIMON_CLIENT_ID = credentials("cimon-client-id")
            CIMON_SECRET = credentials("cimon-secret")
        }
        steps {
            sh 'sudo -E cimon agent start-background'
        }
    }
    ...
}
post {
    always {
        sh 'sudo -E cimon agent stop'
    }
}
