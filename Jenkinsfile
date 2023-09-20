pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'ankitpawar/ankit'
        DOCKER_IMAGE_TAG = 'juicedemoapp'
        TARGET_SERVER = 'http://54.242.159.225/' // Replace with your target server IP or hostname
        TARGET_USERNAME = 'ubuntu' // Replace with your SSH username
        //DOCKERFILE_PATH = 'dockerfile' // Define the path to your Dockerfile here
        DOCKERFILE_PATH = 'dockerfile'
    }

    stages {
        stage('Checkout') {
            steps {
                // Check out your code from Bitbucket
                checkout([$class: 'GitSCM', branches: [[name: 'tenant-fe/docker']], 
                userRemoteConfigs: [[url: 'https://github.com/juice-shop/juice-shop.git']]])

             }
        }

        stage('Build and Deploy') {
            steps {
                script {
                    // Use the DOCKERFILE_PATH environment variable
                    def customImageTag = "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                    sh "docker build -t ${customImageTag} -f ${DOCKERFILE_PATH} ."
                }
            }
        }
    }
}
