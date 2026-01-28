const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('Fetching user stats for user:', req.userId);

    // Get all orders for the user
    const orders = await Order.find({ buyer: req.userId })
      .populate('items.account', 'title platform')
      .sort({ createdAt: -1 });

    console.log('Found orders:', orders.length);

    // Calculate total spent
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate total purchases (total items bought)
    const totalPurchases = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    // Get recent orders (this month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= currentMonth
    );

    // Get recent transactions (last 5 orders with details)
    const recentTransactions = orders.slice(0, 5).map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      date: order.createdAt,
      status: order.orderStatus,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      items: order.items.map(item => ({
        title: item.account?.title || 'Unknown Item',
        platform: item.account?.platform || 'Unknown',
        quantity: item.quantity,
        price: item.price
      }))
    }));

    const stats = {
      totalSpent,
      totalPurchases,
      recentOrdersCount: recentOrders.length,
      recentTransactions,
      totalOrders: orders.length
    };

    console.log('User stats calculated:', stats);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get detailed order history
router.get('/orders', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ buyer: req.userId })
      .populate('items.account', 'title platform')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ buyer: req.userId });

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: page < Math.ceil(totalOrders / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;