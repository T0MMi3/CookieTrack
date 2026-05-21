/**
Stand alone data
    User // references: troopers, documents, orders, inventory, booths, parents, ACL
    Cookie: just list of cookie
    Reward: just list of reward
Need ownerId field: 
    trooper 
    documents
    orders
    inventory
    saleData
 */



const userDataFormat = { 
    // for this, attach a 'role' custom claim to the uid when creating the user
    name: '',
    email: '',
    phone: '',
};

const rewardDataFormat = {
    name: '',
    description: '',
    boxesNeeded: 0,
    downloadUrl: '',
};

const cookieDataFormat = {
    variety: '',
    boxPrice: 0.0,
};

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// need ownerId

const trooperDataFormat = {
    ownerId: '', //id of parent
    parentName: '',
    troopNumber: '',
    trooperName: '',
    troopLeader:'',
    age: 0,
    grade: '',
    shirtSize: '',
    currentReward: [],
    saleDataId: '' //created when trooper is created
};

// archive the order when dateCompleted is not null
const completedOrderDataFormat = {
    // copies of orderDataFormat
};

const orderDataFormat = {
    dateCreated: '',
    status: '', //Not ready for pickup, Ready for pickup, Picked up, Completed -- CASE SENSITIVE
    dateCompleted: '', //Date.now(), will be complete after owe is paid
    trooperId: '',
    trooperName: '',
    ownerId: '', //parent
    ownerEmail: '', //parent
    ownerName: '', //parent
    buyerEmail: '',
    contact: '',
    financialAgreement: false,
    datePickedUp: '', //When status changes to Picked up
    pickupLocation: '',
    orderContent: [{
        cookies: [{
            varietyId: '',
            variety: '',
            boxes: 0,
            boxPrice: 0.0,
            cookieTotalCost: 0.0, //in backend
        },],
        totalCost: 0.0, //in backend
        owe: 0.0, //in backend 
        boxTotal: 0, //in backend
    }],
    cashPaid: 0.0, //amount parent has paid in cash -- can be zero
    cardPaid: 0.0, //amount parent has paid in card -- can be zero
    saleDataId: '' //id from the trooper's saleDataId
};

const parentInventoryDataFormat = {
    ownerId: '',
    owe: 0.0,
    inventory: [
        { varietyId: '',variety: '',boxes: 0,boxPrice: 0.0,},
    ],  
};

const trooperInventoryDataFormat = {
    ownerId: '',
    parentId: '',
    trooperId: '',
    trooperName: '',
    troopNumber: '',
    owe: 0.0,
    inventory: [
        { varietyId: '',variety: '',boxes: 0,boxPrice: 0.0,},
    ],  
};

// when order is made and not in fulfilled, put the missing boxes in needToOrder
const troopInventoryDataFormat = {
    inventory: [{
        varietyId: '',
        variety: '',
        boxes: 0,
        boxPrice: 0.0,
    },],  

    needToOrder: [{
        varietyId: '',
        variety: '',
        boxes: 0,
        boxPrice: 0.0,
    },],  
};

const saleDataformatforTrooper = {
    ownerId: '',
    trooperId: '',
    trooperName: '',
    orderInfo: [
        { id: '', dateCompleted: '', boxTotal: 0, totalCost: 0.0 }, //completed orders
    ],
    cookieData: [
        {varietyId: '', variety: '', boxPrice: '', boxTotal: 0, cookieTotalCost: 0.0,},
    ],
    totalMoneyMade: 0.0, 
    totalBoxesSold: 0,
};

// not use for now, could be use to allow access to saleData
const ACL = {
    userId: "",
    documentACL:[''], // id of the document
    inventoryACL: [''],// id of the inventory
    orderACL: [''],   // id of the order
    saleDataACL: [''], // id of the saleData
    squadACL:[''], //only for leader
    trooperACL: [''], // id of the trooper
    
    boothACL:[''],  // id of the booth
    parentACL:[''], //only for leader
    
};



module.exports = {
    userDataFormat,
    rewardDataFormat,
    cookieDataFormat,
    trooperDataFormat,
    completedOrderDataFormat,
    orderDataFormat,
    saleDataformatforTrooper,
    parentInventoryDataFormat,
    troopInventoryDataFormat,
    trooperInventoryDataFormat,
    ACL,
};