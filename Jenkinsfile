pipeline {
    agent any
    
    tools {
        nodejs NodeJS_24
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            bat 'npm install'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            bat 'npm install'
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Stop existing PM2 processes
                    bat 'pm2 stop ecosystem.config.js || exit 0'
                    bat 'pm2 delete ecosystem.config.js || exit 0'
                    
                    // Start new processes
                    bat 'pm2 start ecosystem.config.js'
                    bat 'pm2 save'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Portfolio Management System deployed successfully!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}