pipeline{
  agent any
  tools{
    jdk 'Java17'
    maven 'Maven3'
    nodejs 'NodeJS20'
  }
  parameters {
        string(name: 'application_url', defaultValue: 'http://10.0.0.4:3000', description: 'URL for ZAP attack')
    }
  
  stages{
    stage('Cleanup Workspace'){
      steps{
        cleanWs()
          }
       }
     stage('Checkout from SCM')
    {
      steps{
          git branch:'main' , credentialsId:'github', url:'https://github.com/ajay11062808/juice-shop-app'
          }
    }
    stage('Owasp Dependency Check'){
      steps{
        script{dependencyCheck additionalArguments: '--format HTML', odcInstallation: 'DP-check'}
      }
    }
    stage('SonarQube Analysis') {
    steps {
        script {
            // Set up the SonarQube environment
              def scannerHome = tool 'sonarqube-scanner'
              env.PATH = "${scannerHome}/bin:${env.PATH}"
            withSonarQubeEnv(credentialsId: 'jenkins-sonarqube-token') {
                      sh "sonar-scanner -Dsonar.projectKey=Juice-Shop-project"
            }
        }
    }
}
    stage('Quality Gate') {
            steps {
                script {
                    // Wait for the SonarQube analysis to complete and check the quality gate
                    waitForQualityGate abortPipeline: false,credentialsId:'jenkins-sonarqube-token'
                }
            }
        }
            stage('Checkout and Build Juice Shop') {
            steps {
                // Clone the Juice Shop repository
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], userRemoteConfigs: [[url: 'https://github.com/ajay11062808/juice-shop-app.git']]])

                // Go into the cloned folder
                dir('juice-shop-app') {
                    // Install dependencies
                    sh 'npm install'
                }
            }
        }

        stage('Start Juice Shop') {
            steps {
                // Start Juice Shop
                dir('juice-shop-app') {
                    sh 'npm start &'
                    sleep 20 // Give some time for the application to start (adjust as needed)
                }
            }
        }

        stage('Run OWASP ZAP Scan') {
          steps {
                script {
                  //Pull the latest Zap image from docker
                sh 'docker pull ghcr.io/zaproxy/zaproxy:stable'
                 // Run ZAP in a Docker container
                sh  'docker run -u root -v zap-data:/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t ${application_url} -g gen.conf -r report.html || true'

            // Create a container from the ZAP Docker image to access the volume
            def zapContainer = docker.image('ghcr.io/zaproxy/zaproxy:stable').run("-v zap-data:/zap/wrk")
            // Copy the ZAP reports from the Docker volume to the Jenkins workspace
            sh "docker cp ${zapContainer.id}:/zap/wrk/report.html ."
            // Stop and remove the container
            zapContainer.stop()
                    
                }
            }
        }
            
 }
  post {
    success {
        echo "Pipeline currentResult: ${currentBuild.currentResult}"
        archiveArtifacts artifacts: 'report.html', fingerprint: true
    }
}
  
}
