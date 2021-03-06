const Sequelize = require('sequelize');
const connection = require("./MainDec");
const User = require("./UserDec");

const LoggedIn = connection.define('loggedin', {
	token: {
		type: Sequelize.STRING,
	},
	active: {
		type: Sequelize.BOOLEAN,
	},
	ip: {
		type: Sequelize.STRING,
	}
}, {
		tableName: 'loggedin'
	});

LoggedIn.belongsTo(User);
User.hasMany(LoggedIn);

module.exports = LoggedIn;