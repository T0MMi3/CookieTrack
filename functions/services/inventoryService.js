const { Firestore } = require('../firebaseConfig');

// Store recent orders that has been picked up
const createParentInventory = async ({ ownerId }) => {
  try {
    const newInventoryRef = Firestore.collection('inventory').doc();
    const newInventoryData = {
      ownerId,
      owe: 0.0,
      inventory: [],
    };
    await newInventoryRef.set(newInventoryData);
    return newInventoryRef.id;
  } catch (error) {
    throw new Error(`Error creating Parent Inventory: ${error.message}`);
  }
};

const createLeaderInventory = async ({ inventory, needToOrder }) => {
  try {
    const newInventoryRef = Firestore.collection('inventory').doc("troop-inventory");
    const newInventoryData = {
      inventory,
      needToOrder,
    };
    await newInventoryRef.set(newInventoryData);
    return newInventoryRef.id;
  } catch (error) {
    throw new Error(`Error creating Leader Inventory: ${error.message}`);
  }
};

// Store cookies assigned by a parent
const createTrooperInventory = async ({ ownerId, parentId, trooperId, trooperName, troopNumber }) => {
  try {
    const newInventoryRef = Firestore.collection('inventory').doc();
    const newInventoryData = {
      ownerId,
      parentId,
      owe: 0.0,
      trooperId,
      trooperName,
      troopNumber,
      inventory: [],
    };
    await newInventoryRef.set(newInventoryData);
    return newInventoryRef.id;
  } catch (error) {
    throw new Error(`Error creating Trooper Inventory: ${error.message}`);
  }
};

const updateParentInventory = async (id, { inventory }) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const ref = Firestore.collection('inventory').doc(id);
      const doc = await transaction.get(ref);
      if (!doc.exists) {
        throw new Error('Parent inventory not found');
      }

      const updatedInventoryData = {
        inventory,
      };
      transaction.update(ref, updatedInventoryData);
    });

    return { message: 'Parent Inventory updated successfully' };
  } catch (error) {
    throw new Error(`Error updating Parent Inventory: ${error.message}`);
  }
};

const updateLeaderInventory = async ({ inventory, needToOrder }) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const ref = Firestore.collection('inventory').doc("troop-inventory");
      const doc = await transaction.get(ref);
      if (!doc.exists) {
        throw new Error('Leader inventory not found');
      }

      const updatedInventoryData = {
        inventory,
        needToOrder
      };
      transaction.update(ref, updatedInventoryData);
    });

    return { message: 'Leader Inventory updated successfully' };
  } catch (error) {
    throw new Error(`Error updating Leader Inventory: ${error.message}`);
  }
};

const updateTrooperInventory = async (id, { inventory }) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const ref = Firestore.collection('inventory').doc(id);
      const doc = await transaction.get(ref);
      if (!doc.exists) {
        throw new Error('Trooper inventory not found');
      }

      //Get the current inventory data
      const currentData = doc.data();

      //Calculate total cost of inventory
      const totalCost = inventory.reduce((total, cookie) => {
        const cookieCost = cookie.boxPrice * cookie.boxes;
        return total + cookieCost;
      }, 0);

      // Get current owe amount and add new total
      const newOweAmount = currentData.owe + totalCost;

      const updatedInventoryData = {
        inventory,
        owe: newOweAmount,
      };

      transaction.update(ref, updatedInventoryData);
    });

    return { message: 'Trooper Inventory updated successfully' };
  } catch (error) {
    throw new Error(`Error updating Trooper Inventory: ${error.message}`);
  }
};

const updateTrooperCookie = async (trooperId, cookiesToAdd) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const parentSnapshot = await transaction.get(Firestore.collection('inventory').where('trooperId', '==', trooperId));
      if (parentSnapshot.empty) {
        throw new Error('No parent inventory found for the given trooper ID');
      }

      const parentDoc = parentSnapshot.docs[0];
      const parentInventory = parentDoc.data().inventory;

      let sufficientCookies = true;
      cookiesToAdd.forEach(cookieToAdd => {
        const parentCookie = parentInventory.find(item => item.varietyId === cookieToAdd.varietyId);
        if (!parentCookie || parentCookie.boxes < cookieToAdd.boxes) {
          sufficientCookies = false;
        }
      });

      if (!sufficientCookies) {
        throw new Error('Not enough cookies in parent inventory');
      }

      const trooperRef = Firestore.collection('inventory').doc(trooperId);
      const trooperDoc = await transaction.get(trooperRef);
      if (!trooperDoc.exists) {
        throw new Error('Trooper inventory not found');
      }

      const trooperInventory = trooperDoc.data().inventory;

      cookiesToAdd.forEach(cookieToAdd => {
        const parentCookie = parentInventory.find(item => item.varietyId === cookieToAdd.varietyId);
        parentCookie.boxes -= cookieToAdd.boxes;

        const trooperCookie = trooperInventory.find(item => item.varietyId === cookieToAdd.varietyId);
        if (trooperCookie) {
          trooperCookie.boxes += cookieToAdd.boxes;
        } else {
          trooperInventory.push(cookieToAdd);
        }
      });

      transaction.update(trooperRef, { inventory: trooperInventory });
      transaction.update(parentDoc.ref, { inventory: parentInventory });
    });

    return { message: 'Trooper Inventory updated successfully' };
  } catch (error) {
    throw new Error(`Error updating Trooper Inventory: ${error.message}`);
  }
};

const getAllInventories = async () => {
  try {
    const snapshot = await Firestore.collection('inventory').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error fetching all Inventories: ${error.message}`);
  }
};

const getLeaderInventory = async () => {
  try {
    const leaderInventoryRef = Firestore.collection('inventory').doc("troop-inventory");
    const leaderInventorySnapshot = await leaderInventoryRef.get();

    if (!leaderInventorySnapshot.exists) {
      return { inventory: [], needToOrder: [] };
    }

    return leaderInventorySnapshot.data();
  } catch (error) {
    throw new Error(`Error fetching leader inventory: ${error.message}`);
  }
};

const deleteInventory = async (id) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const ref = Firestore.collection('inventory').doc(id);
      const doc = await transaction.get(ref);
      if (!doc.exists) {
        throw new Error('Inventory not found');
      }

      transaction.delete(ref);
    });

    return { message: 'Inventory deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting Inventory: ${error.message}`);
  }
};

const getInventoryByOwnerId = async (ownerId) => {
  try {
    const snapshot = await Firestore.collection('inventory').where('ownerId', '==', ownerId).get();
    if (snapshot.empty) return [{ inventory: [], owe: 0 }];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Error fetching inventory by owner ID: ${error.message}`);
  }
};

module.exports = {
  createParentInventory,
  createLeaderInventory,
  createTrooperInventory,
  updateParentInventory,
  updateLeaderInventory,
  updateTrooperInventory,
  updateTrooperCookie,
  getAllInventories,
  getLeaderInventory,
  getInventoryByOwnerId,
  deleteInventory,
};