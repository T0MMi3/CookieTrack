const { Firestore } = require('../firebaseConfig');


const createSquad = async ({ squadName, ownerId }) => {
    try {
        const newsquadRef = Firestore.collection('squads').doc();
        const accessId = [creatorId];
        await newsquadRef.set({
            squadName,
            ownerId, 
        });
        return newsquadRef.id;
    } catch (error) {
        throw new Error(error, `Error creating squad: ${error.message}`);
    }
};

const getSquad = async (id) => {
    try {
        const squadRef = Firestore.collection('squads').doc(id);
        const doc = await squadRef.get();
        if (!doc.exists) {
            throw new Error('Squad not found');
        }
        return doc.data();
    } catch (error) {
        throw new Error(`Error fetching squad: ${error.message}`);
    }
};

const updateSquad = async (id, updateData) => {
    try {
        const squadRef = Firestore.collection('squads').doc(id);
        await squadRef.update(updateData);
        return { message: 'Squad updated successfully' };
    } catch (error) {
        throw new Error(`Error updating squad: ${error.message}`);
    }
};

const deleteSquad = async (id) => {
    try {
        const squadRef = Firestore.collection('squads').doc(id);
        await squadRef.delete();
        return { message: 'Squad deleted successfully' };
    } catch (error) {
        throw new Error(`Error deleting squad: ${error.message}`);
    }
};

const getSquadsByLeaderId = async (leaderId) => {
    try {
        const snapshot = await Firestore.collection('squads').where('ownerId', '==', leaderId).get();
        if (snapshot.empty) {
            throw new Error('No squads found for this leader');
        }
        const squads = [];
        snapshot.forEach(doc => {
            squads.push({ id: doc.id, ...doc.data() });
        });
        return squads;
    } catch (error) {
        throw new Error(`Error fetching squads: ${error.message}`);
    }
};

module.exports = {
    createSquad,
    getSquad,
    updateSquad,
    deleteSquad,
}