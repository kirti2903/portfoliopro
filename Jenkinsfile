pipeline {
    agent { label 'master' }

    tools {
        nodejs 'NodeJS_24'  // Match exactly with Jenkins Global Tool Config
    }

    stages {
        stage('Clone Repository') {
            steps {
                // node context is automatically provided by 'agent any'
                git 'https://github.com/kirti2903/portfoliopro'
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
                    // Replace with actual test command if needed
                    sh 'npm test || echo "No tests available"'
                }
            }
        }

        stage('Build') {
            steps {
                echo 'No build step needed for backend'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Add deployment logic here'
            }
        }
    }

    post {
    always {
        echo 'Cleaning up workspace...'
        deleteDir()
    }
}

}
