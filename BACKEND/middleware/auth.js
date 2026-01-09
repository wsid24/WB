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
        if(error.name === 'TokenExpiredError') {
            const refreshToken = req.headers['Refresh-Token'];
            if(refreshToken){
                try {
                    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                    console.log('Decoded Refresh Token:', decodedRefresh);
                    // Generate new tokens
                    const newToken = jwt.sign(
                        { email: decodedRefresh.email },
                        process.env.JWT_SECRET,
                        { expiresIn: '10s' }
                    );
                    const newRefreshToken = jwt.sign(
                        { email: decodedRefresh.email },
                        process.env.JWT_REFRESH_SECRET,
                        { expiresIn: '30s' }
                    );

                    // Set new tokens in response headers
                    res.setHeader('Authorization', `Bearer ${newToken}`);
                    res.setHeader('Refresh-Token', newRefreshToken);
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
