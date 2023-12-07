pipeline{
  agent any
  tools{
    jdk 'Java17'
    maven 'Maven3'
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
    
    
  }
}
