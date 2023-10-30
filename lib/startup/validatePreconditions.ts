```typescript
const checkIfRequiredFileExists = async (pathRelativeToProjectRoot: string) => {
  const fileName = pathRelativeToProjectRoot.substr(pathRelativeToProjectRoot.lastIndexOf('/') + 1)

  // Sanitize the user input before passing it to path.resolve
  const sanitizedPath = path.normalize(pathRelativeToProjectRoot)

  return access(path.resolve(sanitizedPath)).then(() => {
    logger.info(`Required file ${colors.bold(fileName)} is present (${colors.green('OK')})`)
    return true
  }).catch(() => {
    logger.warn(`Required file ${colors.bold(fileName)} is missing (${colors.red('NOT OK')})`)
    return false
  })
}
```