User.init(
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword) {
          validatePasswordHasAtLeastTenChar(clearTextPassword)
          validatePasswordIsNotInTopOneMillionCommonPasswordsList(clearTextPassword)
          this.setDataValue('password', security.hash(clearTextPassword))
        }
      },