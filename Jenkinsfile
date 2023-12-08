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
    stage('SonarQube Analysis') {
    steps {
        script {
            // Set up the SonarQube environment
            withSonarQubeEnv(credentialsId: 'jenkins-sonarqube-token') {
                // Install Node.js and npm
                def nodejsHome = tool 'NodeJS20'
                env.PATH = "${nodejsHome}/bin:${env.PATH}"

                // Run npm with SonarQube goals
                sh "npm install"
                sh "npm run sonar-scanner"
            }
        }
    }
}

    
    
    
  }
}
