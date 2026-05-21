const { Firestore } = require('../firebaseConfig');

// Service to create a new Reward
const createReward = async ({ name, description, boxesNeeded, choices }) => {
  try {
    const newRewardRef = Firestore.collection('rewards').doc();
    await newRewardRef.set({name,description,boxesNeeded,choices});
    return newRewardRef.id;
  } catch (error) {
    throw new Error('Error creating Reward');
  }
};

// Service to get all Rewards
const getAllRewards = async () => {
  try {
    const snapshot = await Firestore.collection('rewards').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error('Error fetching Rewards');
  }
};

const updateReward = async (id, { name, description, boxesNeeded, downloadUrl }) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const ref = Firestore.collection('rewards').doc(id);

      // Fetch the reward document within the transaction
      const rewardDoc = await transaction.get(ref);
      if (!rewardDoc.exists) {
        throw new Error('Reward not found');
      }

      // Update the reward document
      transaction.update(ref, { name, description, boxesNeeded, downloadUrl });
    });

    return { message: 'Reward updated successfully' };
  } catch (error) {
    throw new Error('Error updating Reward: ' + error.message);
  }
};

// Service to delete a Reward by ID
const deleteReward = async (id) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const ref = Firestore.collection('rewards').doc(id);

      // Fetch the reward document within the transaction
      const rewardDoc = await transaction.get(ref);
      if (!rewardDoc.exists) {
        throw new Error('Reward not found');
      }

      // Delete the reward document
      transaction.delete(ref);
    });

    return { message: 'Reward deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting Reward: ' + error.message);
  }
};


// Allow user to select a reward for a specific troop
const selectRewardForTroop = async (troopId, rewardId, userId, selectedChoice) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      // Validate trooper association
      const trooperRef = Firestore.collection('troopers').doc(troopId);
      const trooperDoc = await transaction.get(trooperRef);

      if (!trooperDoc.exists) {
        throw new Error('Trooper not found');
      }

      const trooperData = trooperDoc.data();

      // Validate reward existence
      const rewardRef = Firestore.collection('rewards').doc(rewardId);
      const rewardDoc = await transaction.get(rewardRef);

      if (!rewardDoc.exists) {
        throw new Error('Reward not found');
      }

      const rewardData = rewardDoc.data();
      rewardData.id = rewardId;

      // Validate the selected choice
      if (selectedChoice && !rewardData.choices.includes(selectedChoice)) {
        throw new Error('Invalid reward choice selected');
      }

      // Add reward selection to the trooper's currentReward array
      const currentReward = trooperData.currentReward || [];
      currentReward.push({
        ...rewardData,
        selectedBy: userId,
        selectedAt: new Date().toISOString(),
        selectedChoice: selectedChoice,
      });

      // Update the trooper's currentReward within the transaction
      transaction.update(trooperRef, { currentReward });
    });

    return { message: 'Reward selected successfully for the trooper' };
  } catch (error) {
    throw new Error('Error selecting reward: ' + error.message);
  }
};



module.exports = {
  createReward,
  getAllRewards,
  updateReward,
  deleteReward,
  selectRewardForTroop
};