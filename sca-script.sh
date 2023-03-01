#!/bin/bash

# Load variables
source variables.txt

RAND=$(date +'%m%d%Y%M%S')
SECRET_FILE="package-lock.json"

cd $REPO
echo "${TITLE}"
echo "Checking out a feature branch: sca-$RAND ${NC}"
git checkout -b "sca-$RAND"
echo SCA_DEMO_BRANCH="sca-$RAND" > ../latest_sca_branch.txt

echo "${TITLE}"
echo "Pushing a package-lock.json file ${NC}"
cp ../2-SCA.sh sca-script.sh
git add sca-script.sh
git commit -m "A commit with the source code of the script"

mkdir $RAND
cp ../$SECRET_FILE $RAND/$SECRET_FILE
git add $RAND/$SECRET_FILE
git commit -m "A commit with vulnerable packages"
git push --set-upstream origin "sca-$RAND"

git checkout main
echo "${TITLE}"
echo "Done pushing the vulnerable packages."
echo "${NC}"