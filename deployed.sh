cd /home/sina/

git pull origin sina

yarn

pm2 start "npm run dev" --name=newwebhook
