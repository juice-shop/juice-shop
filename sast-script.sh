#!/bin/bash

# Load variables
source variables.txt

RAND=$(date +'%m%d%Y%M%S')
SECRET_FILE="sqli.ts"

cd $REPO
echo "${TITLE}"
echo "Checking out a feature branch: sast-$RAND ${NC}"
git checkout -b "sast-$RAND"
echo SAST_DEMO_BRANCH="sast-$RAND" > ../latest_sast_branch.txt

echo "${TITLE}"
echo "Pushing a new file with sql express vulnerability in TypeScript ${NC}"
cp ../3-SAST.sh sast-script.sh
git add sast-script.sh
git commit -m "A commit with the source code of the script"

mkdir $RAND
cp ../$SECRET_FILE $RAND/$SECRET_FILE
git add $RAND/$SECRET_FILE
git commit -m "A commit with vulnerable code"
git push --set-upstream origin "sast-$RAND"

git checkout main
echo "${TITLE}"
echo "Done pushing the vulnerable code."
echo "${NC}"