const Datastore = require('@seald-io/nedb');
const path = require('path');

const ordersDb = new Datastore({
    filename: path.join(__dirname, 'zentro_orders.db'),
    autoload: true,
    timestampData: true
});

ordersDb.ensureIndex(
    { fieldName: 'orderId', unique: true },
    err => {
        if (err) {
            console.error('Orders database index error:', err);
        } else {
            console.log('✅ Orders database ready');
        }
    }
);

module.exports = ordersDb;