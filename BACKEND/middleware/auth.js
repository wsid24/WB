const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

        if (!decoded || !decoded.email) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Attach user info to request object
        req.user = decoded;
        console.log(decoded);

        next();
    } catch (error) {
        if(error instanceof jwt.TokenExpiredError) {
            const refreshToken = req.headers['refresh-token'];
            console.log('Token expired. Refresh Token:', refreshToken);
            if(refreshToken){
                try {
                    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                    console.log('Decoded Refresh Token:', decodedRefresh);
                    res.status(302).json({ message: 'Token expired, please refresh', email: decodedRefresh.email });
                    return;
                } catch (err) {
                    console.error('Refresh Token error:', err);
                    return res.status(401).json({ error: 'Refresh token invalid or expired' });
                }
            }
        }
        console.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

module.exports = authenticate;
