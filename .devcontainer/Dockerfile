FROM mcr.microsoft.com/devcontainers/typescript-node:20
RUN apt update \
    && apt -y upgrade \
    && apt -y install pipx \
    && pipx ensurepath

USER node
RUN bash -c "$(curl -fsSL https://raw.githubusercontent.com/ohmybash/oh-my-bash/master/tools/install.sh)"
RUN pipx install semgrep