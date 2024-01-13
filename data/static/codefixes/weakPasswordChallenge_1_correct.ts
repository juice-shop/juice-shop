User.init(
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword: string) {
          validatePasswordHasAtLeastTenChar(clearTextPassword)
          validatePasswordIsNotInTopOneMillionCommonPasswordsList(clearTextPassword)
          this.setDataValue('password', security.hash(clearTextPassword))
        }
      },