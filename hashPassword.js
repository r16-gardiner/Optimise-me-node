const bcrypt = require('bcrypt');
const saltRounds = 10;

const plainPassword = 'fill in here'
bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error(err);
    } else {
        console.log('Hashed Password:', hash);
        // Store this hash in your database
    }
});
