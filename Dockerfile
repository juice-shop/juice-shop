FROM ubuntu:bionic-20180426

ENV DEBIAN_FRONTEND="noninteractive"

#Install dependencies
RUN apt-get update && apt-get upgrade -y

#Curl Vulnerability https://www.cvedetails.com/cve/CVE-2018-1000300/
RUN apt-get install -y curl && \
#GIT Vulnerability CVE https://www.cvedetails.com/cve/CVE-2018-17456/
    apt-get install -y git && \
#OpenSSH Vulnerability https://www.cvedetails.com/cve/CVE-2018-15473/
    apt-get install -y openssh-server && \
#Installation of ftp server
    apt-get install -y proftpd

COPY ./userfiles/shadow /etc/shadow
COPY ./userfiles/passwd /etc/passwd
RUN chmod o-rwx /etc/shadow
RUN chmod o-rwx /etc/passwd
COPY ./user-data-ftp/ /home/
COPY ./sshd_config /etc/ssh/sshd_config
RUN service ssh start
CMD ["proftpd", "--nodaemon"]
