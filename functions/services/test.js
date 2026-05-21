const { Firestore } = require('../firebaseConfig');
const {saleDataformatforTrooper} = require('../dataFormat');



//INVENTORY SERVICE
// Update Inventory when Order is Created
const updateInventoryOnOrderCreated = async (transaction, orderContent) => {
  for (const item of orderContent) {
    const { varietyId, boxes } = item;

    // Update Parent Inventory
    const parentInventorySnapshot = await transaction.get(
      Firestore.collection('inventory')
        .where('varietyId', '==', varietyId)
        .where('ownerType', '==', 'parent')
    );
    parentInventorySnapshot.forEach(doc => {
      const inventoryData = doc.data();
      const newBoxes = inventoryData.boxes - boxes;
      const inventoryRef = Firestore.collection('inventory').doc(doc.id);
      // atomic transaction using firestore
      transaction.update(inventoryRef, { boxes: newBoxes });
    });

    // Update Leader Inventory
    const leaderInventorySnapshot = await transaction.get(
      Firestore.collection('inventory')
        .where('varietyId', '==', varietyId)
        .where('ownerType', '==', 'leader')
    );

    leaderInventorySnapshot.forEach(doc => {
      const inventoryData = doc.data();
      const newBoxes = inventoryData.boxes - boxes;
      const inventoryRef = Firestore.collection('inventory').doc(doc.id);
      transaction.update(inventoryRef, { boxes: newBoxes });
    });
  }
};

const createOrder = async ({ trooperName, trooperId, ownerId, ownerEmail, buyerEmail, parentName, contact, financialAgreement, orderContent, paymentType }) => {
  try {
    await Firestore.runTransaction(async (transaction) => {
      const newOrderRef = Firestore.collection('orders').doc();
      const newOrderData = {
        ...orderDataFormat,
        dateCreated: new Date().toISOString(),
        trooperId,
        trooperName,
        ownerId,
        ownerEmail,
        buyerEmail,
        parentName,
        contact,
        financialAgreement,
        orderContent,
        paymentType,
      };
      transaction.set(newOrderRef, newOrderData);

      // Update Inventory
      await updateInventoryOnOrderCreated(transaction, orderContent);
    });

    console.log('Order created and inventory updated successfully');
  } catch (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

// Update sale data when an order is completed
const updateSaleData = async (orderData) => {
  const { trooperId, orderContent, totalCost } = orderData;

  const saleDataRef = Firestore.collection('saleData').where('trooperId', '==', trooperId);
  const saleDataSnapshot = await saleDataRef.get();

  // Initialize sale data if it doesn't exist
  if (!saleDataSnapshot.exists) {
    await saleDataRef.set({
      ...saleDataformatforTrooper,
      trooperId,
      trooperName: orderData.trooperName,
      ownerId: orderData.ownerId,
      orderId: [orderData.id],
      totalMoneyMade: totalCost,
      totalBoxesSold: orderContent.reduce((sum, item) => sum + item.boxes, 0),
      cookieData: orderContent.map(item => ({
        varietyId: item.varietyId,
        variety: item.variety,
        boxPrice: item.boxPrice,
        boxTotal: item.boxes,
        cookieTotalCost: item.boxPrice * item.boxes,
      })),
    });
  } else {
    // Update existing sale data
    const saleData = saleDataSnapshot.data();
    const updatedOrderId = [...saleData.orderId, orderData.id];
    const updatedTotalMoneyMade = saleData.totalMoneyMade + totalCost;
    const updatedTotalBoxesSold = saleData.totalBoxesSold + orderContent.reduce((sum, item) => sum + item.boxes, 0);

    const updatedCookieData = saleData.cookieData.map(cookie => {
      const orderItem = orderContent.find(item => item.varietyId === cookie.varietyId);
      if (orderItem) {
        return {
          ...cookie,
          boxTotal: cookie.boxTotal + orderItem.boxes,
          cookieTotalCost: cookie.cookieTotalCost + (orderItem.boxPrice * orderItem.boxes),
        };
      }
      return cookie;
    });

    await saleDataRef.update({
      orderId: updatedOrderId,
      totalMoneyMade: updatedTotalMoneyMade,
      totalBoxesSold: updatedTotalBoxesSold,
      cookieData: updatedCookieData,
    });
  }
};

module.exports = {
  updateInventoryOnOrderCreated,
  createOrder,
  updateSaleData
};


/*
// new version of updateInventory,  will check for inventory to see if we have enough cookie
// -> if yes: take from both inventory and create the order
// -> if no: send email to parent and leader, update leader's needToOrder field, and abort the order creation
const updateInventoryOnOrderCreated = async (transaction, orderContent) => {
  for (const item of orderContent) {
    const { varietyId, boxes } = item;

    // Check Parent Inventory
    const parentInventorySnapshot = await transaction.get(
      Firestore.collection('inventory')
        .where('varietyId', '==', varietyId)
        .where('ownerType', '==', 'parent')
    );

    let parentHasEnough = true;
    parentInventorySnapshot.forEach(doc => {
      const inventoryData = doc.data();
      if (inventoryData.boxes < boxes) {
        parentHasEnough = false;
      }
    });

    // Check Leader Inventory
    const leaderInventorySnapshot = await transaction.get(
      Firestore.collection('inventory')
        .where('varietyId', '==', varietyId)
        .where('ownerType', '==', 'leader')
    );
    let leaderHasEnough = true;
    leaderInventorySnapshot.forEach(doc => {
      const inventoryData = doc.data();
      if (inventoryData.boxes < boxes) {
        leaderHasEnough = false;
      }
    });

    if (!parentHasEnough || !leaderHasEnough) {
      // Send email to parent and leader
      await sendEmail({
        to: [parentEmail, leaderEmail],
        subject: 'Insufficient Inventory',
        text: `There are not enough cookies of variety ${varietyId} to fulfill the order.`,
      });

      // Update leader's needToOrder field
      leaderInventorySnapshot.forEach(doc => {
        const inventoryData = doc.data();
        const needToOrder = inventoryData.needToOrder || [];
        needToOrder.push({ varietyId, boxes });
        const inventoryRef = Firestore.collection('inventory').doc(doc.id);
        transaction.update(inventoryRef, { needToOrder });
      });

      // Abort the order creation
      throw new Error(`Not enough cookies of variety ${varietyId} to fulfill the order.`);
    }
      // Update Parent Inventory
    parentInventorySnapshot.forEach(doc => {
      const inventoryData = doc.data();
      const newBoxes = inventoryData.boxes - boxes;
      const inventoryRef = Firestore.collection('inventory').doc(doc.id);
      transaction.update(inventoryRef, { boxes: newBoxes });
    });

    // Update Leader Inventory
    leaderInventorySnapshot.forEach(doc => {
      const inventoryData = doc.data();
      const newBoxes = inventoryData.boxes - boxes;
      const inventoryRef = Firestore.collection('inventory').doc(doc.id);
      transaction.update(inventoryRef, { boxes: newBoxes });
    });
  }
};
*/