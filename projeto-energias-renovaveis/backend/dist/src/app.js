"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const authenticate_1 = require("./middlewares/authenticate");
const authorize_1 = require("./middlewares/authorize");
const errorHandler_1 = require("./middlewares/errorHandler");
const authRoutes_1 = require("./routes/authRoutes");
const catalogRoutes_1 = require("./routes/catalogRoutes");
const simulationRoutes_1 = require("./routes/simulationRoutes");
const userRoutes_1 = require("./routes/userRoutes");
function createApp() {
    const app = (0, express_1.default)();
    app.disable('x-powered-by');
    app.use((0, cors_1.default)({ origin: env_1.config.corsOrigin === '*' ? true : env_1.config.corsOrigin.split(',').map((value) => value.trim()) }));
    app.use(express_1.default.json({ limit: '1mb' }));
    app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'raiz-renovavel-api' }));
    app.use('/api/auth', authRoutes_1.authRoutes);
    app.use('/api/users', userRoutes_1.userRoutes);
    app.use('/api/energy-sources', (0, catalogRoutes_1.catalogRoutes)('energy_sources'));
    app.use('/api/contents', (0, catalogRoutes_1.catalogRoutes)('educational_contents'));
    app.use('/api/simulations', simulationRoutes_1.simulationRoutes);
    app.get('/api/admin-check', authenticate_1.authenticate, (0, authorize_1.requireRole)('admin'), (_req, res) => res.json({ allowed: true }));
    app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));
    app.use(errorHandler_1.errorHandler);
    return app;
}
