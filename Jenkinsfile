
@Grab(group='org.zaproxy.zap', module='zap-api', version='2.14.0') // Replace with the actual version

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
                    // Assuming ZAP is running on localhost:8090
                    def zapProxy = new org.zaproxy.clientapi.core.ProxyClient('localhost', 8090)
                    def zapScanner = new org.zaproxy.clientapi.core.Scanner(zapProxy)

                    // Get Juice Shop URL
                    def juiceShopUrl = sh(script: 'echo http://localhost:3000', returnStdout: true).trim()

                    // Launch the ZAP Spider
                    zapScanner.scan(targetURL: juiceShopUrl)

                    // Wait for the spider to finish
                    def spiderId = zapScanner.getLastScannerScanId()
                    while (zapScanner.isSpiderRunning(spiderId)) {
                        sleep(3000)
                    }

                    // Launch the ZAP Active Scan
                    zapScanner.scan(targetURL: juiceShopUrl, scanPolicyName: 'Default Policy')

                    // Wait for the active scan to finish
                    def activeScanId = zapScanner.getLastScannerScanId()
                    while (zapScanner.isScanning(activeScanId)) {
                        sleep(3000)
                    }

                    // Generate ZAP reports
                    def reportHtml = zapProxy.core.htmlreport()
                    def reportXml = zapProxy.core.xmlreport()
                    def reportJson = zapProxy.core.jsonreport()

                    // Save reports to a directory
                    def reportsDir = 'zap-reports'
                    dir(reportsDir) {
                        writeFile file: 'report.html', text: reportHtml
                        writeFile file: 'report.xml', text: reportXml
                        writeFile file: 'report.json', text: reportJson
                    }
                }
            }
        }


    
    
    
  }
}
