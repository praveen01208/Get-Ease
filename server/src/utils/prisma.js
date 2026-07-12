"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const path_1 = __importDefault(require("path"));
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({
    url: `file:${path_1.default.join(process.cwd(), 'prisma/dev.db')}`,
});
exports.prisma = new client_1.PrismaClient({ adapter });
//# sourceMappingURL=prisma.js.map