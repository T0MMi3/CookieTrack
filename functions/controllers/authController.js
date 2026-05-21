const { auth, Firestore } = require('../firebaseConfig');
const { registerUser, loginUser } = require('../services/authService');

const registerController = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const result = await registerUser({ email, password, role });
    return res.status(201).json({
      message: 'User registered successfully',
      user: result,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Controller to log in a user.
 * 
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 */
const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await loginUser(email, password);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message });
  }
};


async function googleLogin(req, res) {
  const { idToken } = req.body;

  if (!idToken) return res.status(400).json({ error: 'ID token missing' });

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check if user exists in Firestore
    const userDoc = await Firestore.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      // Create new user document with default "parent" role
      await Firestore.collection('users').doc(uid).set({
        email: decodedToken.email,
        role: 'parent', // Default role
      });
    }

    res.status(200).json({ message: 'Login successful', uid, email: decodedToken.email });
  } catch (error) {
    res.status(401).json({ error: 'Login failed', details: error.message });
  }
}



module.exports = { registerController, loginController, googleLogin};
