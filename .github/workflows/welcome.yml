name: Welcome

on:
  issues:
    types:
      - opened

jobs:
  greeting:
    if: github.repository == 'WebGoat/WebGoat'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/first-interaction@v1.1.1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          issue-message: 'Thanks for submitting your first issue, we will have a look as quickly as possible.'
          pr-message: 'Thanks so much for your contribution, really appreciated! We will have a look and merge it if everything checks out!'
