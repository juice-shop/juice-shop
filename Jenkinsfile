pipeline {
    agent any
    
    triggers {
        // Trigger pipeline on push to the master branch
        githubPush()  // This requires GitHub webhook to be set up
    }

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/DimaOrg85/juice-shop'
            }
        }

        stage('Print Dockerfile Content') {
            steps {
                script {
                    def dockerfileContent = readFile('Dockerfile')
                    echo "Dockerfile Content: 12345678"
                    echo dockerfileContent
                }
            }
        }
    }
}

