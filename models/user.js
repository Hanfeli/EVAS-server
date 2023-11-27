module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User",{
        username: {
            type: DataTypes.STRING,
          },
          password: {
            type: DataTypes.STRING,
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
          disabled: {
            type: DataTypes.BOOLEAN,
          },
          email:{
            type: DataTypes.STRING,
          }
    })

    User.associate = (models) => {
        User.belongsToMany(models.Role, {through: 'User_Role_Relations',  foreignKey: 'user_id', otherKey: 'role_id' })
    }

    return User
}