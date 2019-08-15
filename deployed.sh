cd /home/sina/

git pull origin sina

npm i

pm2 start "npm run dev" --name=newwebhook
