const Role = require('../../models/role.model');
const systemConfig = require('../../config/system');

//[GET] admin/roles/index
module.exports.index = async(req, res) => {
    const find = {
        deleted: false
    }

    const records = await Role.find(find);

    res.render('admin/pages/roles/index', {
        pageTitle: 'Trang nhóm quyền',
        records: records
    });
}

//[GET] admin/roles/create
module.exports.create = async(req, res) => {
    res.render('admin/pages/roles/create', {
        pageTitle: 'Tạo nhóm quyền'
    });
}

//[POST] admin/roles/create
module.exports.createPost = async(req, res) => {
    const record = new Role(req.body);
    record.save();
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
}

//[GET] admin/roles/detail
module.exports.detail = async(req, res) => {
    const id = req.params.id;
    const record = await Role.findOne({_id: id}, {deleted: false});
    res.render('admin/pages/roles/detail', {
        pageTitle: 'Chi tiết nhóm quyền',
        record: record
    })
}

//[GET] admin/roles/edit/:id
module.exports.edit = async(req, res) => {
    try {
        const data = await Role.findOne({_id: req.params.id}, {deleted: false});
        res.render('admin/pages/roles/edit', {
            pageTitle: 'Chỉnh sửa nhóm quyền',
            data: data
        });
        req.flash('success', 'Cập nhật thành công !');
    } catch(error) {
        req.flash('error', 'Lỗi! Cập nhật thất bại!');
        res.redirect(`${systemConfig.prefixAdmin}/roles`);
    }
    
}

//[PATCH] admin/roles/edit/:id
module.exports.editPatch = async(req, res) => {
    try {
        await Role.updateOne({_id: req.params.id}, req.body);
        req.flash('success', 'Cập nhật thành công !');
    } catch(error) {
        req.flash('error', 'Lỗi! Cập nhật thất bại!');
    }
    
    res.redirect('back');
}

//[DELETE] admin/roles/delete/:id
module.exports.delete = async(req, res) => {
    await Role.deleteOne({_id: req.params.id});
    req.flash('succes', 'Xóa thành công !');
    res.redirect('back');
}

//[GET] admin/roles/permissions
module.exports.permissions = async(req, res) => {
    const find = {
        deleted: false
    }

    const records = await Role.find(find);
    res.render('admin/pages/roles/permissions', {
        pageTitle: 'Trang phân quyền',
        records: records
    })
}

//[PATCH] admin/roles/permissions
module.exports.permissionsPatch = async(req, res) => {
    const permissions = JSON.parse(req.body.permissions);

    for (const item of permissions) {
        await Role.updateOne({_id: item.id}, {permissions: item.permissions});
    }

    req.flash('success', 'Cập nhật thành công');
    res.redirect('back');
}