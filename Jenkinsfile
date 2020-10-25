pipeline {
  agent any
  
  tools {nodejs "node"}
  
  stages {
    stage('build') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }

    stage('test') {
      steps {
        sh 'npm run test'
      }
    }

  }
}