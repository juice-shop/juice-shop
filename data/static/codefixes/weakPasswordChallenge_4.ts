User.init(
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword) {
          validatePasswordIsNotInTopOneMillionCommonPasswordsList(clearTextPassword)
          this.setDataValue('password', security.hash(clearTextPassword))
        }
      },