User.init(
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword) {
          validatePasswordHasAtLeastOneNumber(clearTextPassword)
          validatePasswordHasAtLeastOneSpecialChar(clearTextPassword)
          validatePasswordHasAtLeastOneUpperCaseChar(clearTextPassword)
          validatePasswordHasAtLeastOneLowerCaseChar(clearTextPassword)
          validatePasswordHasAtLeastTenChar(clearTextPassword)
          validatePasswordIsNotInTopOneMillionCommonPasswordsList(clearTextPassword)
          this.setDataValue('password', security.hash(clearTextPassword))
        }
      },