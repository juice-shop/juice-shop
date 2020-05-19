systemctl start docker
cd ~/github/juice-shop/
git pull
docker build -t mu71l473d/kiwa-shop:v1.0.0 .
