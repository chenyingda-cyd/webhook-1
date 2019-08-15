cd /home/sina/

git pull origin sina

pm2 start "npm run dev" --name=newwebhook
