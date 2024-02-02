pipeline {
    agent any
    
    environment {
        JUICE_SHOP_REPO = 'https://github.com/bkimminich/juice-shop.git'
        SNYK_TOKEN = credentials('snyk-token') // Assumes you have a Jenkins credential named 'snyk-token' with your Snyk token
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    // Checkout the Juice Shop repository
                    checkout([$class: 'GitSCM', branches: [[name: '*/master']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[url: JUICE_SHOP_REPO]]])
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    // Assuming your build process, for example, using npm
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Test with Snyk') {
            steps {
        snykSecurity failOnError: false, snykInstallation: 'snyk@latest', snykTokenId: 'SNYK_API'
            }  
        }

        stage('Deploy') {
            steps {
                script {
                    // Assuming your deployment process, for example, using Docker
                    sh 'docker build -t juice-shop .'
                    sh 'docker run -p 3000:3000 -d juice-shop'
                }
            }
        }
    }

    post {
        success {
            echo 'Build, test, and deployment successful!'
        }
        failure {
            echo 'Build, test, or deployment failed!'
        }
    }
}
