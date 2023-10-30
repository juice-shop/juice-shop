```typescript
models.sequelize.query(`SELECT * FROM Users WHERE email = :email AND password = :password AND deletedAt IS NULL`, 
{ 
  model: UserModel, 
  plain: true,
  replacements: { email: req.body.email || '', password: security.hash(req.body.password || '') }
})
```