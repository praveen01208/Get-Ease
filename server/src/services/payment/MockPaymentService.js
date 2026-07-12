"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPaymentService = void 0;
const IPaymentService_1 = require("./IPaymentService");
const uuid_1 = require("uuid");
class MockPaymentService {
    async createOrder(amount, currency, courseId, userId) {
        // Simulate a small delay like a real payment gateway
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            orderId: `mock_order_${(0, uuid_1.v4)().slice(0, 8)}`,
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