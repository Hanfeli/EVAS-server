const jwt = require('jsonwebtoken');
const HttpError = require('./http-error');

const checkJwt = (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            throw new Error('身份驗證失敗！');
        }

        const decodedToken = jwt.verify(token, 'secretkey');
        req.userData = decodedToken;
        console.log(req.userData);
        next();
    } catch (err) {
        return next(new HttpError('身份驗證失敗！', 401));
    }
};


 module.exports = checkJwt