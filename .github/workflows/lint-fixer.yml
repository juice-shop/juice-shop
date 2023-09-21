name: "Let me lint:fix that for you"

on: [push]

jobs:
  LMLFTFY:
    runs-on: ubuntu-latest
    steps:
    - name: "Check out Git repository"
      uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
    - name: "Use Node.js 18"
      uses: actions/setup-node@5e21ff4d9bc1a8cf6de233a3057d20ec6b3fb69d #v3.8.1
      with:
        node-version: 18
    - name: "Install CLI tools"
      run: npm install -g @angular/cli
    - name: "Install application"
      run: |
        npm install --ignore-scripts
        cd frontend
        npm install --ignore-scripts --legacy-peer-deps
    - name: "Fix everything which can be fixed"
      run: 'npm run lint:fix'
    - uses: stefanzweifel/git-auto-commit-action@3ea6ae190baf489ba007f7c92608f33ce20ef04a #v4.16.0
      with:
        commit_message: "Auto-fix linting issues"
        branch: ${{ github.head_ref }}
        commit_options: '--signoff'
        commit_user_name: JuiceShopBot
        commit_user_email: 61591748+JuiceShopBot@users.noreply.github.com
        commit_author: JuiceShopBot <61591748+JuiceShopBot@users.noreply.github.com>
