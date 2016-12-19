sudo yum -y install git

git clone https://github.com/eyeballcode/FontsProof/

echo "[mongodb-org-3.2]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2013.03/mongodb-org/3.2/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.2.asc" |
  sudo tee -a /etc/yum.repos.d/mongodb-org-3.2.repo

sudo yum -y update && sudo yum install -y mongodb-org-server \
    mongodb-org-shell mongodb-org-tools

curl --silent --location https://rpm.nodesource.com/setup_7.x | sudo bash -

sudo yum -y install nodejs

echo -n "Enter the server name: "
read SERVER

echo "description "TFH"
author      "Eyeball"

start on started mountall
stop on shutdown

respawn
respawn limit 100 5

script
  cd /home/ec2-user/FontsProof/$SERVER
  sudo node base.js
end script" | 
    sudo tee -a /etc/init/$SERVER.conf

sudo start $SERVER
