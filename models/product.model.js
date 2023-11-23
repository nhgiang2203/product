const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const productScheme = new mongoose.Schema({
    title: String,
    product_category_id: {
        type: String,
        default: ""
    },
    description: String,
    price: Number,
    discountPercentage: Number,
    stock: Number,
    thumbnail: String,
    status: String,
    featured: String,
    position: Number,
    slug: { 
        type: String, 
        slug: "title",
        unique: true
     },
    createBy: {
        account_id: String,
        createAt: {
            type: Date,
            default: Date.now
        }
    },
    updatedBy: [
        {
        account_id: String,
        updatedAt: Date
        }
    ],
    deleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        account_id: String,
        deletedAt: Date
    }
},
{
    timestamps: true
}
);

const Product = mongoose.model('Product', productScheme, 'products');

module.exports = Product;