pipeline{
  agent any
  tools{
    jdk 'Java17'
    maven 'Maven3'
    nodejs 'NodeJS20'
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
    
    
    
  }
}
