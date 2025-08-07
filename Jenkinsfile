pipeline {
    agent { label 'master' }  // Or your Jenkins node label

    tools {
        nodejs 'NodeJS 18' // Make sure this name matches the NodeJS version name in Jenkins
    }

    environment {
        // Example if you need DB URL or secret keys
        // DB_URL = credentials('my-db-url')
    }

    stages {
        stage('Clone Repo') {
            steps {
                git 'https://github.com/kirti2903/FinalUpdatedproject.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Build step - optional for Node.js backend'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploy step - can be added later'
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
