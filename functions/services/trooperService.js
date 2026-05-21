const { Firestore } = require('../firebaseConfig');
const admin = require('firebase-admin');
const { createSaleData } = require('./saleDataService');

const createTrooper = async ({ ownerId, parentName, troopNumber, trooperName, troopLeader, age, grade, shirtSize }) => {
  try {
    const newTroopRef = Firestore.collection('troopers').doc();

    //Create initial sale data for the trooper
    const trooperId = newTroopRef.id;
    const saleDataId = await createSaleData({ ownerId, trooperId, trooperName });

    const troopData = {
      ownerId,
      parentName,
      troopNumber,
      trooperName,
      troopLeader,
      age,
      grade,
      shirtSize,
      currentReward: [],
      saleDataId: saleDataId
    };

    await newTroopRef.set(troopData);

    return newTroopRef.id;
  } catch (error) {
    throw new Error(error, `Error creating troop: ${error.message}`);
  }
};

const getAllTroopers = async () => {
  try {
    const snapshot = await Firestore.collection('troopers').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.log("getAllTroopers Service", error);
    throw new Error(`Error fetching troops: ${error.message}`);
  }
};

// Service to get a troop by ID
const getTrooperById = async (id) => {
  try {
    const doc = await Firestore.collection('troopers').doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    throw new Error('Troop not found');
  } catch (error) {
    throw new Error(`Error fetch troop by id: ${error.message}`);

  }
};

const updateTrooper = async (id, { troopNumber, trooperName, troopLeader, age, grade, shirtSize }) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const trooperRef = Firestore.collection('troopers').doc(id);

      // Fetch the current trooper data within the transaction
      const trooperDoc = await transaction.get(trooperRef);
      if (!trooperDoc.exists) {
        throw new Error('Trooper not found');
      }
      const trooperData = trooperDoc.data();

      const updatedTrooperData = {
        troopNumber,
        trooperName,
        troopLeader,
        age,
        grade,
        shirtSize,
        ...trooperData,
      };

      // Update the trooper with the new data
      transaction.update(trooperRef, updatedTrooperData);
    });

    return { message: 'Trooper updated successfully' };
  } catch (error) {
    throw new Error(`Error updating trooper: ${error.message}`);
  }
};

const deleteTrooper = async (id) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const ref = Firestore.collection('troopers').doc(id);

      // Fetch the trooper document within the transaction
      const doc = await transaction.get(ref);
      if (!doc.exists) {
        throw new Error('Trooper not found');
      }

      // Delete the trooper document within the transaction
      transaction.delete(ref);
    });

    return { message: 'Trooper deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting trooper: ${error.message}`);
  }
};

const getAllTroopersByOwnerId = async (userId) => {
  try {
    const snapshot = await Firestore.collection('troopers').where('ownerId', '==', userId).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error fetching troopers by assigned parent: ${error.message}`);
  }
};



module.exports = {
  createTrooper,
  getAllTroopers,
  getTrooperById,
  updateTrooper,
  deleteTrooper,
  getAllTroopersByOwnerId,
};