pipeline {
    agent any

    environment {
        AZURE_CREDENTIALS = credentials('azure-service-principal')
        AZURE_APP_NAME = 'juice-shop-app'
        AZURE_RESOURCE_GROUP = 'juice-shop-resource-group'
    }

    stages {
        stage('Build') {
            steps {
                script {
                    docker.build('juice-shop:latest')
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    docker.image('juice-shop:latest').inside {
                        sh 'pytest'
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    docker.image('juice-shop:latest').inside {
                        withCredentials([string(credentialsId: 'azure-service-principal', variable: 'AZURE_CREDENTIALS')]) {
                            sh '''
                            az login --service-principal -u $AZURE_CREDENTIALS_USR -p $AZURE_CREDENTIALS_PSW --tenant $AZURE_CREDENTIALS_TEN
                            az webapp up --name $AZURE_APP_NAME --resource-group $AZURE_RESOURCE_GROUP --sku F1 --runtime "PYTHON|3.9"
                            '''
                        }
                    }
                }
            }
        }
    }
}
