module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define("Role",{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        rolename: {
            type: DataTypes.STRING,
        },
        disabled: {
            type: DataTypes.BOOLEAN,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    })
    
    Role.associate = (models) => {
        Role.belongsToMany(models.User, {through: 'user_role_relations',  foreignKey: 'role_id', otherKey: 'user_id'  })
    }

    return Role
}