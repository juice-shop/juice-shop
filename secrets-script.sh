#!/bin/bash

# Load variables
source variables.txt

RAND=$(date +'%m%d%Y%M%S')
SECRET_FILE="auth.py"

cd $REPO
echo "${TITLE}"
echo "Checking out a feature branch: secret-$RAND ${NC}"
git checkout -b "secret-$RAND"

echo "${TITLE}"
echo "Pushing a new file with a secret ${NC}"
cp ../1-secrets.sh secrets-script.sh
git add secrets-script.sh
git commit -m "A commit with the source code of the secrets script"
cp ../$SECRET_FILE $SECRET_FILE
CONTENT=$(cat $SECRET_FILE)
git add $SECRET_FILE
git commit -m "A commit with some secret sauce"
git push --set-upstream origin "secret-$RAND"

git checkout main
echo "${TITLE}"
echo "Done pushing a secret. Here is the content:"
echo "$CONTENT"
echo ""
echo "Let's see the magic..."
echo "${NC}"