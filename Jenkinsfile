pipeline {
    agent any

    stages {
        // Stage 1: Клонирование репозитория
        stage('Checkout Repository') {
            steps {
                git url: 'https://github.com/EndlessEmptiness1nside/juice-shop.git ',
                     branch: 'master' // или нужная ветка
                echo "Репозиторий OWASP Juice Shop успешно склонирован" [[2]]
            }
        }

        // Stage 2: Установка зависимостей
        stage('Install Dependencies') {
            steps {
                script {
                    try {
                        // Установка Node.js и npm (если не установлено)
                        sh 'node -v || echo "Node.js не установлен"'
                        sh 'npm install' // Установка зависимостей из package.json
                        echo "Зависимости успешно установлены"
                    } catch (Exception e) {
                        echo "Ошибка при установке зависимостей: ${e}"
                        currentBuild.result = 'FAILURE'
                        throw e
                    }
                }
            }
        }

        // Stage 3: Сборка и запуск приложения
        stage('Build & Run Application') {
            steps {
                script {
                    try {
                        // Запуск приложения в фоновом режиме
                        sh 'npm start &'
                        echo "Приложение запущено на http://localhost:3000"
                    } catch (Exception e) {
                        echo "Ошибка запуска приложения: ${e}"
                        currentBuild.result = 'FAILURE'
                        throw e
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline завершен. Проверьте результаты в логах."
        }
    }
}
