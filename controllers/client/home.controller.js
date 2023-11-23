const Product = require('../../models/product.model');
const productHelper = require('../../helpers/products');

//[GET] /
module.exports.index = async(req, res) => {
    //Lấy sản phẩm nổi bật
    const productsFeatured = await Product.find({
        featured: "1",
        deleted: false,
        status: "active"
    }).limit(6);

    const newProductsFeatured = productHelper.priceNewProducts(productsFeatured);

    //Lấy sản phẩm mới
    const productsNew = await Product.find({
        deleted: false,
        status: "active"
    }).sort({position: "desc"}).limit(6);
    const newProductsNew = productHelper.priceNewProducts(productsNew);

    res.render('client/pages/home/index', {
        pageTitle: 'Trang chủ',
        productsFeatured: newProductsFeatured,
        productsNew: newProductsNew
    });
}