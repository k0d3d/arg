
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Order = mongoose.model('Order')

/**
 * New order
 */

exports.add = function(req, res){
  res.render('orders/add', {
    title: 'New Order',
    order: new Order({})
  })
}
/**
 * Create an order
 */

exports.createOrder = function (req, res) {
  var order = new Order(req.body);
  order.save(function (err) {
    if (!err) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({"task":"save-order","status": true,"payload":""}));
      res.end();
    }
    console.log(err);
  });
};
/**
 * List
 */

exports.getOrders = function(req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
  var perPage = 30
  var options = {
  }

  Order.list(options, function(err, orders) {
    if (err) return res.render('500')
     // res.writeHead(200, { 'Content-Type': 'application/json' })
     // res.write(JSON.stringify(orders))
    res.render('/orders/list',{
      title: 'All Orders',
      orders: orders
    })

  })
}