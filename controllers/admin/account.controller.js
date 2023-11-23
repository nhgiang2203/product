const Account = require('../../models/account.model');
const Role = require('../../models/role.model');
const systemConfig = require('../../config/system');
var md5 = require('md5');

//[GET] /admin/accounts
module.exports.index = async (req, res) => {
    const records = await Account.find({deleted: false}).select("-password -token");

    for (const record of records) {
        const role = await Role.findOne({
            _id: record.role_id,
            deleted: false
        });
        record.role = role;
    }

    res.render('admin/pages/accounts/index', {
        pageTitle: 'Danh sách tài khoản',
        records: records
    });
}

//[GET] admin/accounts/create
module.exports.create = async (req, res) => {
    const roles = await Role.find({deleted: false});
    res.render('admin/pages/accounts/create', {
        pageTitle: 'Danh sách tài khoản',
        roles: roles
    });
}

//[POST] admin/accounts/create
module.exports.createPost = async (req, res) => {
    const emailExist = await Account.findOne({
        email: req.body.email,
        deleted: false
    });
    if (emailExist) {
        req.flash('error', `Email ${req.body.email} đã tồn tại`);
        res.redirect('back');
    } else {
        req.body.password = md5(req.body.password);

        const account = new Account(req.body);
        await account.save();
        res.redirect(`${systemConfig.prefixAdmin}/accounts`);
    }

}

//[GET] admin/accounts/edit/:id
module.exports.edit = async(req, res) => {
    const find = {
        deleted: false,
        _id: req.params.id
    }
    
    const data = await Account.findOne(find);
    const roles = await Role.find({
        deleted: false
    })

    res.render('admin/pages/accounts/edit', {
        pageTitle: 'Chỉnh sửa tài khoản',
        data: data,
        roles: roles
    })
}

//[PATCH] admin/accounts/edit/:id
module.exports.editPatch = async(req, res) => {
    const emailExist = await Account.findOne({
        _id: { $ne: req.params.id }, //ne: not equal ==> tìm bản ghi khác với bản ghi này
        email: req.body.email,
        deleted: false
    })
    if (emailExist) {
        req.flash('error', `Email ${req.body.email} đã tồn tại`);
    } else {
        if (req.body.password){
            req.body.password = md5(req.body.password);
        } else {
            delete req.body.password;
        }
        await Account.updateOne({_id: req.params.id}, req.body);
        req.flash("success", "Cập nhật tài khoản thành công!");
    }
    res.redirect("back");
    
}