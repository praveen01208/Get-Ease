"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPaymentService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class MockPaymentService {
    async createOrder(amount, currency, courseId, userId) {
        // Simulate a small delay like a real payment gateway
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            orderId: `mock_order_${crypto_1.default.randomUUID().slice(0, 8)}`,
            amount,
            currency,
            key: 'mock_key_test',
        };
    }
    async verifyPayment(verification) {
        // Mock always succeeds after a brief delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        return true;
    }
}
exports.MockPaymentService = MockPaymentService;
//# sourceMappingURL=MockPaymentService.js.map