const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
  try {
    const {id, status} = await orderService.createOrder(req.body);
    console.log('Order created successfully:', { id: id, status: status });
    res.status(201).json({ message: 'Order created successfully', id: id, status: status });
  } catch (error) {
    console.error('Failed to create order:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    console.log('Fetch all orders successfully', orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Failed to fetch all orders', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await orderService.updateOrder(id, req.body);
    console.log('Update order successfully', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to update order', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateOrderPaidAmount = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await orderService.updateOrderPaidAmount(id, req.body);
    console.log('Update order payment successfully', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to update order payment', error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await orderService.deleteOrder(id);
    console.log('Delete order successfully', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to delete order', error.message);
    res.status(500).json({ message: error.message });
  }
};

const markOrderComplete = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await orderService.markOrderComplete(id);
    console.log('Order marked complete successfully:', result);
    res.status(200).json({ message: 'Order marked complete successfully', result });
  } catch (error) {
    console.error('Failed to mark order complete:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const archiveOrders = async (req, res) => {
  try {
    const result = await orderService.archiveOrders(req.body);
    console.log('Orders archived successfully:', result);
    res.status(200).json({ message: 'Orders archived successfully', result });
  } catch (error) {
    console.error('Failed to archive orders:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getOrdersByTrooperId = async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await orderService.getOrdersByTrooperId(id);
    console.log('getOrdersByTrooperId successfully', orders);
    res.status(200).json(orders);
  } catch (error) {
    console.log('Failed to getOrdersByTrooperId', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getOrdersByOwnerId = async (req, res) => {
  const { id } = req.params;
  try {
    const orders = await orderService.getOrdersByOwnerId(id);
    console.log('getOrdersByOwnertId successfully', orders);
    res.status(200).json(orders);
  } catch (error) {
    console.log('Failed to getOrdersByOwnerId', error.message);
    res.status(500).json({ message: error.message });
  }
};

const parentPickup = async (req, res) => {
  const { id } = req.params;
  const { ownerEmail } = req.body;
  try {
    const result = await orderService.parentPickup(id, ownerEmail);
    console.log('Order marked as picked up successfully:', result);
    res.status(200).json({ message: 'Order marked as picked up successfully', result });
  } catch (error) {
    console.error('Failed to mark order as picked up:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateNeedToOrder = async (req, res) => {
  try {
    const { varietyId } = req.params;
    const { updatedCookies } = req.body;
    const result = await orderService.updateNeedToOrder(varietyId, updatedCookies);
    res.status(200).json({ message: 'UpdateNeedToOrder successfully:', result });
  } catch (error) {
    console.error('Failed to UpdateNeedToOrder:', error.message);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createOrder,
  getAllOrders,
  updateOrder,
  updateOrderPaidAmount,
  deleteOrder,
  markOrderComplete,
  archiveOrders,
  getOrdersByTrooperId,
  getOrdersByOwnerId,
  parentPickup,
  updateNeedToOrder

};