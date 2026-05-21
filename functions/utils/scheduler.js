const functions = require('firebase-functions');
const {  archiveOrders } = require('../services/orderService');

// Schedule the moveCompletedOrders function to run daily
/*
const moveCompletedOrders = functions.pubsub.schedule('every week').onRun(async (context) => {
    await archiveOrders();
    console.log('Scheduled function executed: moveCompletedOrders');
});
*/

const updateMonthlySales = async () => {
    try {
        const cookiesRef = Firestore.collection('cookies');
        const snapshot = await cookiesRef.get();

        snapshot.forEach(async (doc) => {
            const data = doc.data();
            const { soldAmount } = data;

            // Add soldAmount to the monthlySold array
            const currentMonth = new Date().getMonth();
            const monthlySold = data.monthlySold || [];
            monthlySold[currentMonth] = soldAmount;

            // Reset soldAmount and update monthlySold
            await cookiesRef.doc(doc.id).update({
                soldAmount: 0,
                monthlySold,
            });
        });

        console.log('Monthly sales data updated successfully');
    } catch (error) {
        console.error('Error updating monthly sales data:', error.message);
    }
};

const getMonthlyCookies = async () => {
    try {
        const currentMonth = new Date().getMonth() + 1;

        const snapshot = await Firestore.collection('cookies').get();
        if (snapshot.empty) {
            return 'No cookies found';
        }

        const cookies = snapshot.docs.map((doc) => {
            const data = doc.data();
            const monthlySold = data.monthlySold || {};
            const currentMonthSold = monthlySold[currentMonth] || 0; // Directly get the current month's sales
            return { id: doc.id, name: data.name, currentMonthSold };
        });

        // Sort by sales and return the top 3
        const sortedCookies = cookies.sort((a, b) => b.currentMonthSold - a.currentMonthSold);
        return sortedCookies.slice(0, 3);
    } catch (error) {
        throw new Error(`Error fetching monthly cookies: ${error.message}`);
    }
};



module.exports = { 
    updateMonthlySales, 
    //moveCompletedOrders,
    getMonthlyCookies
};
