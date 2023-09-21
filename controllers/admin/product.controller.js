//[GET] /admin/products
const Product = require('../../models/product.model');
const filterStatusHelper = require('../../helpers/filterStatus');
const searchHelper = require('../../helpers/search');
const paginationHelper = require('../../helpers/pagination');
const systemConfig = require('../../config/system')

//[GET] /admin/products
module.exports.index = async (req, res) => {
    

    //Filter status
    const filterStatus= filterStatusHelper(req.query);

   
    let find = {
        deleted: false,
    };

    if (req.query.status)
        find.status = req.query.status;


    //Search 
    const search = searchHelper(req.query);
    if (search.regex)
        find.title = search.regex;
    
    //Pagination
    const countProducts = await Product.count(find);
    let objectPagination = paginationHelper(
        {
        currentPage: 1,
        limitedItems: 4
        },
        req.query,
        countProducts
    )
    
    

    const products = await Product.find(find)
    .limit(objectPagination.limitedItems)
    .skip(objectPagination.skip)
    .sort({position:'desc'});
    //console.log(products);

    res.render('admin/pages/products/index', {
        pageTitle: 'Danh sách sản phẩm',
        products: products,
        filterStatus: filterStatus,
        keyword: search.keyword,
        pagination: objectPagination
    });
}

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await Product.updateOne({_id: id}, {status: status}); //trong database trường id có dấu gạch chân: _id
    req.flash('success', 'Cập nhật trạng thái thành công');
    res.redirect('back');
    
}

//[PATCH] /admin/products/change-multi/:status/:id
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(', ');
    
    switch (type) {
        case 'active':
            await Product.updateMany({_id: { $in: ids }}, {status: 'active'});
            req.flash('success', `Cập nhật trạng thái thành công cho ${ids.length} sản phẩm`);
            break;
        case 'inactive':
            await Product.updateMany({_id: { $in: ids }}, {status: 'inactive'});
            req.flash('success', `Cập nhật trạng thái thành công cho ${ids.length} sản phẩm`);
            break;
        case 'delete-all':
            await Product.updateMany({_id: { $in: ids }}, {
                deleted: true,
                deletedAt: new Date()
            });
            req.flash('success', `Đã xóa thành công cho ${ids.length} sản phẩm`);
            break;
        case 'change-position':
            for (let item of ids) {
                let [id, position] = item.split('-');
                position = parseInt(position);
                // console.log(id);
                // console.log(position);
                await Product.updateOne({_id: id}, {position: position});
            }
            req.flash('success', `Đã cập nhật vị trí thành công cho ${ids.length} sản phẩm`);
                
            break;  
    }

    res.redirect('back');
}

//[DELETE] /admin/products/delete/:id  
// Xóa vĩnh viễn: mất data
// module.exports.deleteItem = async (req, res) => {
//     const id = req.params.id;

//     await Product.deleteOne({_id: id});

//     res.redirect('back');
    
// }

// Xóa mềm: Trong data vẫn còn
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await Product.updateOne({_id: id}, {
        deleted: true,
        deletedAt: new Date()
    });
    req.flash('success', `Đã xóa thành công sản phẩm`);
    res.redirect('back');
    
}


//[GET] admin/products/create
module.exports.create = (req, res) => {
    res.render('admin/pages/products/create', {
        pageTitle: 'Thêm mới sản phẩm'
    });
}

//[POST] admin/products/create
module.exports.createPost = async (req, res) => {
    console.log(req.file)
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);

    if (req.body.position == ""){
        const countProducts = await Product.count();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    if (req.file){
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }
    

    const product = new Product(req.body);
    await product.save();

    res.redirect(`${systemConfig.prefixAdmin}/products`);
}

//[GET] /admin/products/edit
module.exports.edit = async (req, res) => {
    try{
        const find = {
            deleted: false,
            _id: req.params.id
        }

        const product = await Product.findOne(find);

        res.render('admin/pages/products/edit', {
            pageTitle: 'Chỉnh sửa sản phẩm',
            product: product
        });
    } catch {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
    
}

//[PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);
    

    if (req.file){
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }
    
    try{
        await Product.updateOne({_id: id}, req.body);
        req.flash('success', 'Cập nhật thành công');
    } catch {
        req.flash('error', 'Cập nhật thất bại');
    }

    res.redirect(`back`);
}

//[GET] /admin/products/detail
module.exports.detail = async (req, res) => {
    const id = req.params.id;
    const find = {
        deleted: false,
        _id: id
    }
    const product = await Product.findOne(find);
    res.render('admin/pages/products/detail', {
        pageTitle: product.title,
        product: product
    })
}

//[GET] /admin/products/restore
module.exports.restore = async (req, res) => {

    const find = {
        deleted: true
    }

    const products = await Product.find(find);

    res.render('admin/pages/products/bin', {
        pageTitle: 'Thùng rác',
        products: products
    });
}

//[PATCH] /admin/products/bin/restore/:id
module.exports.restorePatch = async (req, res) => {
    const id = req.params.id;

    await Product.updateOne({_id: id}, {
        deleted: false,
        deletedAt: new Date()
    });

    req.flash('success', 'Khôi phục thành công !');
    res.redirect('back');
}

//[DELETE] /admin/products/bin/delete/:id
module.exports.bin = async (req, res) => {
    const id = req.params.id;

    await Product.deleteOne({_id: id});
    req.flash('success', 'Xóa sản phẩm thành công !');
    res.redirect('back');
}