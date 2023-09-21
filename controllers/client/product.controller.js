const Product = require ('../../models/product.model');
//[GET] /products

module.exports.index = async (req, res) => {
    const products = await Product.find({
        status: 'active',
        deleted: false
    }).sort({position:'desc'});

    const newProducts = products.map(item => {
        item.priceNew = (item.price*(100 - item.discountPercentage)/100).toFixed(0);
        return item;
    });

    res.render('client/pages/products/index', {
        pageTitle: 'Danh sách sản phẩm',
        products : newProducts
    });
}

//[GET] /products/detail/:slug
module.exports.detail = async (req, res) => {
    try {
        const slug = req.params.slug;
        const find = {
            slug: slug,
            status: "active",
            deleted: false
        }

        const product = await Product.findOne(find);
        console.log(product);

        res.render('client/pages/products/detail', {
            pageTitle: product.title,
            product : product
        });
    } catch(error) {
        res.redirect('/products')
    }
    
}

