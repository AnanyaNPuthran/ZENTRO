const Datastore = require('@seald-io/nedb');
const path = require('path');

const productsDb = new Datastore({
    filename: path.join(__dirname, 'zentro_products.db'),
    autoload: true,
    timestampData: true
});

productsDb.ensureIndex(
    { fieldName: 'id', unique: true },
    err => {
        if (err) {
            console.error('Product database index error:', err);
        } else {
            console.log('✅ Products database ready');
        }
    }
);

module.exports = productsDb;