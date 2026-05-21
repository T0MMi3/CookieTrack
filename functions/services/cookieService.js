const { Firestore } = require('../firebaseConfig');

const createCookie = async ({ variety, boxPrice }) => {
  try {
    // Check if a cookie with the same name already exists
    const existingCookieSnapshot = await Firestore.collection('cookies')
      .where('variety', '==', variety)
      .get();

    if (!existingCookieSnapshot.empty) {
      throw new Error(`Cookie with name "${variety}" already exists`);
    }
    const newCookieRef = Firestore.collection('cookies').doc();
    await newCookieRef.set({
      variety,
      boxPrice,
    });
    return newCookieRef.id;
  } catch (error) {
    throw new Error(`Error creating cookie: ${error.message}`);
  }
};


const getAllCookies = async () => {
  try {
    const snapshot = await Firestore.collection('cookies').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error fetching all cookie: ${error.message}`);
  }
};

const updateCookie = async (id, { variety, boxPrice }) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const ref = Firestore.collection('cookies').doc(id);

      // Fetch the cookie document within the transaction
      const cookieDoc = await transaction.get(ref);
      if (!cookieDoc.exists) {
        throw new Error('Cookie not found');
      }

      // Check if a cookie with the same variety already exists (excluding the current one)
      const existingCookieSnapshot = await Firestore.collection('cookies')
        .where('variety', '==', variety)
        .get();

      if (!existingCookieSnapshot.empty) {
        const existingCookie = existingCookieSnapshot.docs[0];
        if (existingCookie.id !== id) {
          throw new Error(`Cookie with variety "${variety}" already exists`);
        }
      }

      // Update the cookie document
      transaction.update(ref, {
        variety,
        boxPrice,
      });
    });

    return { message: 'Cookie updated successfully' };
  } catch (error) {
    throw new Error(`Error updating cookie: ${error.message}`);
  }
};

const deleteCookie = async (id) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const ref = Firestore.collection('cookies').doc(id);

      // Fetch the cookie document within the transaction
      const cookieDoc = await transaction.get(ref);
      if (!cookieDoc.exists) {
        throw new Error('Cookie not found');
      }

      // Delete the cookie document
      transaction.delete(ref);
    });

    return { message: 'Cookie deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting cookie: ${error.message}`);
  }
};



module.exports = {
  createCookie,
  getAllCookies,
  updateCookie,
  deleteCookie,
};