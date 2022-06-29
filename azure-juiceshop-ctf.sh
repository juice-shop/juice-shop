#!/bin/bash

# Path for tmp file used for creating CTFd config
FILE="./ctfd-config.yml"
# Should be unique to your CTF
CTF_KEY=ThisKiwaShopIs1337
# Containers will be prefixed with this
CTF_INSTANCE_PREFIX=kiwashopctf
# No instances of Juice Shop you want
NO_INSTANCE=1
# The Azure RG
AZURE_RG_NAME=fssp-we-rg-kiwashop
# Azure RG Location
AZURE_RG_LOCATION="westeurope"


create_juice_shop_containers() {
  echo "Setting up JuiceShop instances"
  for (( i = 1; i <= $NO_INSTANCE; i++ ))
  do
     echo "Creating instance #$i"
     JS_INSTANCE_NAME="$CTF_INSTANCE_PREFIX-$i"

     az container create \
       --resource-group $AZURE_RG_NAME \
       --name $JS_INSTANCE_NAME --dns-name-label $JS_INSTANCE_NAME \
       --image kiwashopregistry.azurecr.io/samples/kiwashop \
       --ports 3000 --ip-address public \
       -e "CTF_KEY=$CTF_KEY" "NODE_ENV=ctf"   
  done  
}

create_azure_resource_group() {
  az group create --name $AZURE_RG_NAME --location $AZURE_RG_LOCATION  
}

create_ctfd_instance() {
  CTF_INSTANCE_NAME="$CTF_INSTANCE_PREFIX-ctf"

  echo "Setting up CTFd server. Upload created package into it"
  az container create \
    --resource-group $AZURE_RG_NAME \
    --name $CTF_INSTANCE_NAME \
    --image ctfd/ctfd \
    --dns-name-label $CTF_INSTANCE_NAME \
    --ports 8000 \
    --ip-address public  
}

create_ctfd_config() {
  JUICE_INSTANCE="http://$CTF_INSTANCE_PREFIX-1.$AZURE_RG_LOCATION.azurecontainer.io:3000"
  echo "Creating config for CTFd ..."
  echo "Fetching challenges from $JUICE_INSTANCE"
    
/bin/cat <<EOM >$FILE
ctfFramework: CTFd 2.x
juiceShopUrl: $JUICE_INSTANCE
ctfKey: $CTF_KEY
insertHints: free
insertHintUrls: paid
EOM

  echo "Creating CTFd import package ..."
  docker run -ti --rm -v $(pwd):/data bkimminich/juice-shop-ctf --config $FILE
  rm $FILE
}


# 1
create_azure_resource_group 
# 2
create_juice_shop_containers
# 3
create_ctfd_instance
# 4
create_ctfd_config
