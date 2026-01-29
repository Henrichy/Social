const express = require('express');
const router = express.Router();
const https = require('https');
const Order = require('../models/Order');
const Account = require('../models/Account');
const auth = require('../middleware/auth');

// Create order after payment verification
router.post('/create-order', auth, async (req, res) => {
  try {
    console.log('=== CREATE ORDER REQUEST ===');
    console.log('User ID:', req.userId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', req.headers.authorization);

    const { cartItems, paymentReference, paymentMethod, totalAmount } = req.body;
    
    if (!cartItems || !paymentReference || !paymentMethod || !totalAmount) {
      console.log('Missing required fields:', { cartItems: !!cartItems, paymentReference: !!paymentReference, paymentMethod: !!paymentMethod, totalAmount: !!totalAmount });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    console.log('Generated order number:', orderNumber);

    // Validate cart items before processing
    console.log('Validating cart items...');
    const validCartItems = [];
    const invalidItems = [];
    
    for (const cartItem of cartItems) {
      const account = await Account.findById(cartItem._id);
      if (!account) {
        console.log('Invalid cart item - account not found:', cartItem._id, cartItem.title);
        invalidItems.push(cartItem);
      } else {
        validCartItems.push(cartItem);
      }
    }
    
    if (invalidItems.length > 0) {
      console.log('Found invalid cart items:', invalidItems.length);
      return res.status(400).json({ 
        error: 'Some items in your cart are no longer available',
        invalidItems: invalidItems.map(item => ({
          id: item._id,
          title: item.title
        })),
        message: 'Please remove these items from your cart and try again'
      });
    }
    
    console.log('All cart items validated successfully');

    // Prepare order items with credentials
    const orderItems = [];
    for (const cartItem of validCartItems) {
      console.log('Processing cart item:', cartItem._id, cartItem.title);
      const account = await Account.findById(cartItem._id);
      if (!account) {
        console.log('Account not found:', cartItem._id);
        return res.status(404).json({ error: `Account not found: ${cartItem._id}` });
      }

      console.log('Found account:', account.title);
      console.log('Available credentials:', account.availableCredentialsCount);
      console.log('Credentials inventory:', account.credentialsInventory?.length || 0);

      // Check if we have enough available credentials
      const availableCredentials = account.credentialsInventory && Array.isArray(account.credentialsInventory)
        ? account.credentialsInventory.filter(cred => !cred.isSold)
        : [];
      console.log('Available credentials count:', availableCredentials.length);
      
      if (availableCredentials.length < cartItem.quantity) {
        console.log('Not enough credentials available');
        return res.status(400).json({ 
          error: `Not enough credentials available for ${account.title}. Available: ${availableCredentials.length}, Requested: ${cartItem.quantity}` 
        });
      }

      // Mark credentials as sold and assign to buyer
      const credentialsToSell = availableCredentials.slice(0, cartItem.quantity);
      console.log('Credentials to sell:', credentialsToSell.length);
      
      for (const credential of credentialsToSell) {
        credential.isSold = true;
        credential.soldAt = new Date();
        credential.soldTo = req.userId;
      }

      // Add item with credentials to order
      const orderItem = {
        account: account._id,
        quantity: cartItem.quantity,
        price: account.price,
        credentials: credentialsToSell.map(cred => ({
          email: cred.email,
          password: cred.password,
          username: cred.username,
          phone: cred.phone,
          recoveryEmail: cred.recoveryEmail,
          additionalInfo: cred.additionalInfo
        }))
      };
      
      console.log('Order item created:', {
        account: orderItem.account,
        quantity: orderItem.quantity,
        price: orderItem.price,
        credentialsCount: orderItem.credentials.length
      });
      
      orderItems.push(orderItem);

      // Save the account with updated credentials
      await account.save();
      console.log('Account saved with updated credentials');
    }

    console.log('Order items prepared:', orderItems.length);

    // Create order
    const order = new Order({
      orderNumber,
      buyer: req.userId,
      items: orderItems,
      totalAmount,
      paymentMethod,
      paymentReference,
      paymentStatus: 'completed',
      orderStatus: 'completed',
      deliveryStatus: 'delivered'
    });

    await order.save();
    console.log('Order saved successfully:', order._id);
    console.log('Order items in saved order:', order.items.length);
    console.log('First item credentials:', order.items[0]?.credentials?.length || 0);

    const responseData = {
      success: true,
      message: 'Order created successfully',
      order: {
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt
      }
    };
    
    console.log('Sending response with order items:', responseData.order.items.length);
    console.log('First item credentials in response:', responseData.order.items[0]?.credentials?.length || 0);

    res.json(responseData);

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.userId })
      .populate('items.account', 'title platform')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Verify Paystack payment
router.post('/verify-payment', async (req, res) => {
  try {
    const { reference } = req.body;
    
    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      return res.status(500).json({ error: 'Paystack secret key not configured' });
    }

    // Verify payment with Paystack
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`
      }
    };

    const paystackReq = https.request(options, (paystackRes) => {
      let data = '';

      paystackRes.on('data', (chunk) => {
        data += chunk;
      });

      paystackRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.status && response.data.status === 'success') {
            // Payment verified successfully
            res.json({
              success: true,
              message: 'Payment verified successfully',
              data: response.data
            });
          } else {
            // Payment verification failed
            res.status(400).json({
              success: false,
              message: 'Payment verification failed',
              data: response
            });
          }
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'Error parsing Paystack response',
            error: error.message
          });
        }
      });
    });

    paystackReq.on('error', (error) => {
      res.status(500).json({
        success: false,
        message: 'Error connecting to Paystack',
        error: error.message
      });
    });

    paystackReq.end();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;