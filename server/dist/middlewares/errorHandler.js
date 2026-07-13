"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err.name === 'ZodError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: err.errors
        });
    }
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        success: false,
        message
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map