User.init(
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword: string) {
          validatePasswordHasAtLeastOneNumber(clearTextPassword)
          validatePasswordHasAtLeastOneSpecialChar(clearTextPassword)
          validatePasswordHasAtLeastOneUpperCaseChar(clearTextPassword)
          validatePasswordHasAtLeastOneLowerCaseChar(clearTextPassword)
          validatePasswordHasAtLeastTenChar(clearTextPassword)
          this.setDataValue('password', security.hash(clearTextPassword))
        }
      },