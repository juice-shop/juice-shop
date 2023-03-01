#!/bin/bash

# Load variables
source variables.txt

RAND=$(date +'%m%d%Y%M%S')
SECRET_FILE="vault.tf"

cd $REPO
echo "${TITLE}"
echo "Checking out a feature branch: iac-$RAND ${NC}"
git checkout -b "iac-$RAND"

echo "${TITLE}"
echo "Pushing a new file with vulnerable Terraform configurations ${NC}"
cp ../4-IaC.sh IaC-script.sh
git add IaC-script.sh
git commit -m "A commit with the source code of the IaC script"

mkdir $RAND
cp ../$SECRET_FILE $RAND/$SECRET_FILE
git add $RAND/$SECRET_FILE
git commit -m "A commit with vulnerable IaC configs"
git push --set-upstream origin "iac-$RAND"

git checkout main
echo "${TITLE}"
echo "Done pushing the IaC code"
echo "${NC}"