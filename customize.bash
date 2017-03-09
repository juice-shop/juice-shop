#!/bin/bash

# Author: Timo Pagel, https://github.com/wurstbrot

# Setup
# $ git clone https://github.com/wurstbrot/juice-shop.git
# $ cd juice-shop
# $ npm install
# $ ./customize.bash
# $ npm start
# Go to browser and login with admin@<COMPANY_DOMAIN> with the simple admin password

####### Start customizing here:

# Should be png
COMPANY_LOGO_URL="https://openclipart.org/image/2400px/svg_to_png/181617/insurance.png"
#Used for E-Mails
COMPANY_DOMAIN="umbrella-insurance.de"
COMPANY_NAME="Umbrella Insurance"

FAKED_USER_EMAILS_COUNT=100

#Max 10
FAKED_USER_EMAILS_RANDOM_DOMAINS=(
google.de
facebook.com
youtube.com
google.com
wikipedia.org
amazon.de
yahoo.com
ebay.de
web.de
owasp.org
)

# Deletion of exsisting products will not take place automatically, you might want to delelte them after running this script in data/datacreator.js
FAKED_PRODUCTS=(
"LebensversicherungA"
"LebensversicherungB"
"LebensversicherungC"
"LebensversicherungD"
"ReiseversicherungA"
"ReiseversicherungB"
"ReiseversicherungC"
"ReiseversicherungD"
"ReiseversicherungF"
)
FAKED_PRODUCTS_IMAGE_URL="https://openclipart.org/image/2400px/svg_to_png/181617/insurance.png"

####### Customizing ends

DOMAIN_FILES=$(grep -Rl "umbrella-insurance.de" * | grep -v vagrant)

for DOMAIN_FILE in $DOMAIN_FILES;do
	cat $DOMAIN_FILE | sed "s/umbrella-insurance.de/$COMPANY_DOMAIN/g" > /tmp/domain-file.tmp
	cat /tmp/domain-file.tmp > $DOMAIN_FILE
done

if [ "$COMPANY_LOGO_URL" != "" ]; then
	wget -O app/public/images/JuiceShop_Logo.png $COMPANY_LOGO_URL
fi

sed "s/>OWASP Juice Shop </>$COMPANY_NAME </" app/index.html > /tmp/juice-Index
mv /tmp/juice-Index app/index.html

# Disable notifications
echo "
.alert {display:none;}" >> app/css/app.css

USER_TEMPLATE="
    models.User.create({
	email: 'EMAIL',
	password: 'PASSWORD'
    });"

REPLACE_STRING="function createUsers () { "
for i in $(seq $FAKED_USER_EMAILS_COUNT); do
	RANDOM_USERNAME=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
	RANDOM_PASSWORD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

	RANDOM_NUMBER=$(cat /dev/urandom | tr -dc '0-9' | fold -w 256 | head -n 1 | head --bytes 1)
	RANDOM_DOMAIN=${FAKED_USER_EMAILS_RANDOM_DOMAINS[$RANDOM_NUMBER]}

	RANDOM_EMAIL="$RANDOM_USERNAME@$RANDOM_DOMAIN"

	PREPARED_USER=$(echo $USER_TEMPLATE | sed "s/EMAIL/$RANDOM_EMAIL/g" | sed "s/PASSWORD/$RANDOM_PASSWORD/g")
	REPLACE_STRING="$REPLACE_STRING $PREPARED_USER"
done


cat data/datacreator.js | sed "s/function createUsers () {/$REPLACE_STRING/" > /tmp/datacreator.js
cat /tmp/datacreator.js > data/datacreator.js

wget -O app/public/images/products/eggfruit_juice.jpg $FAKED_PRODUCTS_IMAGE_URL
PRODUCT_TEMPLATE_STRING="    models.Product.create({
      name: 'NAME',
      description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
      price: 8.99,
      image: 'eggfruit_juice.jpg'
    });";

REPLACE_STRING="function createProducts () {"
for PRODUCT in ${FAKED_PRODUCTS[@]};do
	PREPARED_PRODUCT=$(echo $PRODUCT_TEMPLATE_STRING | sed "s/NAME/$PRODUCT/g")
	REPLACE_STRING="$REPLACE_STRING $PREPARED_PRODUCT"
done
cat data/datacreator.js | sed "s/function createProducts () {/$REPLACE_STRING/" > /tmp/datacreator.js
cat /tmp/datacreator.js > data/datacreator.js
