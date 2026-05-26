User.init(
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword: string) {
          validatePasswordIsNotInTopOneMillionCommonPasswordsList(clearTextPassword)
          this.setDataValue('password', security.hashPassword(clearTextPassword))
        }
      },