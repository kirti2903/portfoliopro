module.exports = {
  apps: [
    {
      name: 'portfolio-backend',
      script: 'server.js',
      cwd: './backend',
      watch: false,
      autorestart: true,
      windowsHide: true,
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        DB_HOST: 'localhost',
        DB_USER: 'root',
        DB_PASSWORD: 'n3u3da!',
        DB_NAME: 'portfolio_db'
      }
    },
    {
      name: 'portfolio-frontend',
      script: 'serve',
      cwd: './frontend',
      args: '-s build -l 3000',
      autorestart: true,
      watch: false,
      windowsHide: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}