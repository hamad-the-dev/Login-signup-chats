import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    // Get token from either Authorization header or cookies
    let token = null;
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    
    // If no token in header, check cookies
    if (!token) {
        token = req.cookies.token;
    }

    if (!token) {
        console.log('No token found in either header or cookies');
        return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if (!tokenDecode.id) {
            return res.status(401).json({ success: false, message: 'Invalid token format' });
        }

        // Add user ID to both body and query for flexibility
        if (!req.body) req.body = {};
        req.body.userid = tokenDecode.id;
        
        if (!req.query) req.query = {};
        req.query.userid = tokenDecode.id;

        // Store the user ID in request for other middleware/routes
        req.userId = tokenDecode.id;
        
        next();
    } catch (error) {
        console.log('Token verification error:', error.message);
        return res.status(401).json({ 
            success: false, 
            message: error.name === 'TokenExpiredError' 
                ? 'Token has expired' 
                : 'Invalid token'
        });
    }
}

export default userAuth;