const {User, Role, sequelize} = require('../models')
const { Op } = require("sequelize");
const { validationResult } = require('express-validator');
const HttpError = require('../utils/http-error');
const bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

const handleError = (next, error) => {
    console.error(error);
    next(new HttpError('Internal Server Error', 500));
};


const getUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userData.id, {
            include: [{
                model: Role,
                attributes: ['rolename'],
                through: {
                    attributes: [], // 如果不需要額外的屬性，可以設置為空數組
                },
                as: 'Roles',
            }],
        });
        if (!user) {
            throw new HttpError('User not found', 404);
        }
    
        res.status(200).json(user);
    } catch (error) {
        handleError(next, error);
    }
}

const createUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError(`${JSON.stringify(errors.array())}`, 422);
    }
    const { username, password, confirmPassword, email, role } = req.body;

    if (password !== confirmPassword) {
        return res.status(422).json({ errors: [{ msg: 'Passwords do not match' }] });
    }
  
    try {
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            throw new HttpError('Email has already been used.', 422);
        }
    
        const existingRole = await Role.findOne({ where: { rolename: role } });
        if (!existingRole) {
            throw new HttpError('Invalid role selected.', 422);
        }
        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword = bcryptjs.hashSync(password, salt);

        await sequelize.transaction(async (t) => {
            const newUser = await User.create({
            username,
            password:hashedPassword,
            email,
            }, { transaction: t });
    
            await newUser.addRole(existingRole, { transaction: t });
        });
    
        res.status(200).send('User created successfully.');
    } catch (error) {
        handleError(next, error);
    }
};

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError(`${JSON.stringify(errors.array())}`, 422);
    }
    try {
        const user = await User.findOne({
          where: { username: req.body.username },
        });

        console.log(user);
    
        if (!user) {
            throw new HttpError('User not found', 404);
        }
    
        const checkPassword = bcryptjs.compareSync(req.body.password, user.password);
    
        if (!checkPassword) {
            throw new HttpError('Wrong password or name', 400);
        }
    
        const token = jwt.sign({ username: user.username }, 'secretkey');
        const { password, ...others } = user;
    
        res.cookie('accessToken', token, {
          httpOnly: true,
        }).status(200).json(token);
    } catch (error) {
        handleError(next, error);
    }
}

const searchUser = async (req, res, next) => {
    const { searchUsername, searchRole } = req.body;
    try {
        let users;
        if (searchUsername && searchRole) {
            // 如果同時提供了用戶名和角色名，使用 AND 條件
            users = await User.findAll({
              where: {
                [Op.and]: [
                  { username: { [Op.like]: `%${searchUsername}%` } },
                  { '$Roles.rolename$': { [Op.like]: `%${searchRole}%` } },
                ],
              },
              include: {
                model: Role,
                attributes: ['rolename'],
                through: {
                  attributes: [],
                },
                as: 'Roles',
              },
            });
        }else if (searchUsername) {
            users = await User.findAll({
                where: {
                    username: { [Op.like]: `%${searchUsername}%` },
                    },
                    include: {
                    model: Role,
                    attributes: ['rolename'],
                    through: {
                        attributes: [], // 如果不需要額外的屬性，可以設置為空數組
                    },
                    as: 'Roles',
                },
            });
        } else if (searchRole) {
            users = await User.findAll({
                where: {
                    '$Roles.rolename$': { [Op.like]: `%${searchRole}%` },
                },
                include: {
                    model: Role,
                    attributes: ['rolename'],
                    through: {
                        attributes: [],
                    },
                    as: 'Roles',
                },
            });
        } else {
            return res.status(400).send('Please provide a username or role for search.');
        }
    
            res.json(users);
        } catch (error) {
            handleError(next, error);
    }
};

const updateUser = async (req, res, next) => {
    const { username, Password, Roles, Status } = req.body;


    try {
        const user = await User.findByPk(req.userData.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.username = username || user.username;
        user.Password = Password || user.Password;
        user.Roles = Roles || user.Roles;
        user.Status = Status || user.Status;

        await user.save();

        res.status(200).send('User data updated successfully');
    } catch (error) {
        handleError(next, error);
    }
};



  
module.exports = {
    createUser,
    searchUser,
    login,
    getUser,
    updateUser
}