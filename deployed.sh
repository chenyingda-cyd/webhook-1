cd /home/sina/

git pull origin sina

npm i

pm2 del sina


pm2 start "npm run dev" --name=sina
