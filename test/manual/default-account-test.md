# Manual Default-Account Test

Use this procedure after starting the fork with no seeded privileged passwords.

Set secure environment passwords before startup:

```powershell
$env:JUICE_SHOP_ADMIN_PASSWORD = 'Use-a-long-random-admin-password'
$env:JUICE_SHOP_SUPPORT_PASSWORD = 'Use-a-long-random-support-password'
$env:JUICE_SHOP_CLOUD_ADMIN_PASSWORD = 'Use-a-long-random-cloud-password'
npm.cmd start
```

Send each legacy credential pair to the login endpoint. Every request must return HTTP 401.

## Admin

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/rest/user/login -ContentType 'application/json' -Body '{"email":"admin@juice-sh.op","password":"admin123"}'
```

## Support

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/rest/user/login -ContentType 'application/json' -Body '{"email":"support@juice-sh.op","password":"J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P"}'
```

## Cloud admin

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/rest/user/login -ContentType 'application/json' -Body '{"email":"cloud-admin@juice-sh.op","password":"DVKH3gn7G$2Rk!f5Tz@9Lm&Qp4Wx#Yj8Bc0Ns6Ue1Io7Ah2Sd4Fg6Hj8Kl0Zx3Cv5Bn7Mq9Wr1Et3Yu5Ip"}'
```

## Exposed testing account

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/rest/user/login -ContentType 'application/json' -Body '{"email":"testing@juice-sh.op","password":"IamUsedForTesting"}'
```

Pass criteria:

- Every legacy account request returns HTTP 401.
- Configured passwords are never returned in a response or written to source files.
- Environment values are changed for every deployed environment.
