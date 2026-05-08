name: Dynamic Application Security Testing (DAST)

on:
  push:
    branches: [ "master" ]
  workflow_dispatch:

permissions:
  id-token: write
  contents: read
  issues: write


jobs:
  Build_Publish_Stage:
    runs-on: ubuntu-latest
    name: Build, Publish, and Stage
    steps:
    - uses: actions/checkout@v2
    - name: ZAP Full Scan
      # You may pin to the exact commit or the version.
      # uses: zaproxy/action-full-scan@75ee1686750ab1511a73b26b77a2aedd295053ed
      uses: zaproxy/action-full-scan@v0.12.0
      with:
        # GitHub Token to create issues in the repository
        token: ${{ github.token }}
        # Target URL
        target: 'https://juiceshop-dev-devsecops-${{ secrets.LABINSTANCEID }}.azurewebsites.net'
        # The Docker file to be executed
        docker_name: ghcr.io/zaproxy/zaproxy:stable
        # The title for the GitHub issue to be created
        issue_title: 'ZAP Full Scan Report'
        # The action status will be set to fail if ZAP identifies any alerts during the full scan
        fail_action: true # optional
        # Whether Github issues should be created or not
        allow_issue_writing: true # optional, default is true
        # The name of the artifact that contains the ZAP reports
        artifact_name: zap_scan # optional, default is zap_scan
          
              
