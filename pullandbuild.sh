systemctl start docker
cd ~/Github/juice-shop
git pull
docker build -t mu71l473d/kiwa-shop:latest .
