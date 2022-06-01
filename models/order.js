const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
	products: [
		{
			product: {
				type: Object,
				required: true,
			},
			quantity: {
				type: Number,
				required: true,
			},
		},
	],
	user: {
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: true,
		},
		username: {
			type: String,
		},
	},
});

module.exports = mongoose.model('Order', orderSchema)