"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_categories_controller_1 = require("../../controllers/admin.categories.controller");
const router = (0, express_1.Router)();
router.get('/', admin_categories_controller_1.getCategories);
router.post('/', admin_categories_controller_1.createCategory);
router.put('/:id', admin_categories_controller_1.updateCategory);
router.delete('/:id', admin_categories_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categories.routes.js.map