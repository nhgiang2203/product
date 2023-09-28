const ProductCategory = require('../../models/product-category.model');
const systemConfig = require('../../config/system');
const createTreeHelper = require('../../helpers/createTree');

//[GET] /admin/products-category/
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    }

    const records = await ProductCategory.find(find);
    const newRecords = createTreeHelper.tree(records);

    res.render('admin/pages/products-category/index', {
        pageTitle: 'Danh mục sản phẩm',
        records: newRecords
    });
}

//[GET] admin/products-category/create
module.exports.create = async (req, res) => {
    const find = {
        deleted: false
    }

    const records = await ProductCategory.find(find);

    const newRecords = createTreeHelper.tree(records);

    res.render('admin/pages/products-category/create', {
        pageTitle: 'Tạo danh sách sản phẩm',
        records: newRecords
    });
}

//[POST] admin/products-category/create
module.exports.createPost = async (req, res) => {
    if (req.body.position == ""){
        const countProducts = await ProductCategory.count();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    const record = new ProductCategory(req.body);
    await record.save();

    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
}

//[PATCH] /admin/products-category/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await ProductCategory.updateOne({_id: id}, {status: status}); //trong database trường id có dấu gạch chân: _id
    req.flash('success', 'Cập nhật trạng thái thành công');
    res.redirect('back');
    
}

//[GET] admin/products-category/detail/:id
module.exports.detail = async(req, res) => {
    const id = req.params.id;
    const find = {
        _id: id,
        deleted: false
    }
    const record = await ProductCategory.findOne(find);
    res.render('admin/pages/products-category/detail', {
        pageTitle: "Chi tiết danh mục",
        record: record
    })
}

//[GET] /admin/products-category/edit/:id 
module.exports.edit = async(req, res) => {
    try {
        const id = req.params.id;

        const find = {
            _id: id,
            deleted: false
        }
        
        const record = await ProductCategory.findOne(find);
        const records = await ProductCategory.find({deleted: false});
        const newRecords = createTreeHelper.tree(records);
        console.log(newRecords)


        res.render('admin/pages/products-category/edit', {
            pageTitle: 'Chỉnh sửa danh mục',
            record: record,
            records: newRecords
        });
    } catch(error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
   
}

//[PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async(req, res) => {
    const id = req.params.id;
    req.body.position = parseInt(req.body.position);

    if (req.file){
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }
    
    try{
        await ProductCategory.updateOne({_id: id}, req.body);
        req.flash('success', 'Cập nhật thành công');
    } catch (error) {
        req.flash('error', 'Cập nhật thất bại');
    }

    res.redirect(`back`);
}

//[DELETE] /admin/products-category/delete/:id
module.exports.delete = async(req, res) => {
    const id = req.params.id;
    const find = {
        _id: id,
        deleted: false
    }
    await ProductCategory.updateOne({_id: id}, {deleted: true});
    req.flash('success', 'Xóa thành công !');
    res.redirect('back');
}