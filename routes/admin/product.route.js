const express = require('express');
const router = express.Router();
const multer  = require('multer')
//const storageMulter = require('../../helpers/storageMulter');
const upload = multer();
const controller = require('../../controllers/admin/product.controller');
const validate = require("../../validates/admin/product.validate");
const middleware = require('../../middlewares/admin/uploadCloud.middleware')
router.get('/', controller.index);
router.patch('/change-status/:status/:id', controller.changeStatus);
router.patch('/change-multi', controller.changeMulti);
router.delete('/delete/:id', controller.deleteItem);
router.get('/create', controller.create);
router.post('/create', upload.single('thumbnail'), middleware.upload, validate.createPost, controller.createPost);

router.get('/edit/:id', controller.edit);
router.patch('/edit/:id', upload.single('thumbnail'), middleware.upload, validate.createPost, controller.editPatch);

router.get('/detail/:id', controller.detail);

router.get('/bin', controller.restore);
router.patch('/bin/restore/:id', controller.restorePatch);
router.delete('/bin/delete/:id', controller.bin);
module.exports = router;