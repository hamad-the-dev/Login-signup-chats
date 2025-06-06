import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.json({ success: false, message: 'Unauthorized' });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
       if(tokenDecode.id){
        if (!req.body) req.body = {};
        req.body.userid = tokenDecode.id;
   
        if (req.method === 'GET') {
            if (!req.query) req.query = {};
            req.query.userid = tokenDecode.id;
        }
       } else{
        return res.json({ success: false, message: 'Unauthorized Again Login' });
       }
       next();
        
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export default userAuth;