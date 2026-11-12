// Schemas concentram validação dos contratos recebidos pelas rotas públicas e administrativas.
import { z } from 'zod';
import { hasMinimumScenarioInput } from '../calculator.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(190),
  password: z.string().min(10).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const simulationInputSchema = z.object({
  location: z.string().max(160).optional().default(''),
  distributor: z.string().max(160).optional(),
  targetKwp: z.number().positive().optional(),
  targetKwhMonth: z.number().positive().optional(),
  targetSavingsMonth: z.number().positive().optional(),
  coveragePercent: z.number().positive().max(100).optional(),
  monthlyBill: z.number().positive().optional(),
  tariff: z.number().positive().optional(),
  tariffTE: z.number().positive().optional(),
  tariffTUSD: z.number().positive().optional(),
  fioBShare: z.number().min(0).max(1).optional(),
  gd2TransitionPercent: z.number().min(0).max(1).optional(),
  gd2Category: z.string().max(80).optional(),
  budget: z.number().positive().optional(),
  availableAreaM2: z.number().positive().optional(),
  hspKwhM2Day: z.number().positive().max(10).optional(),
  solarSource: z.string().max(190).optional(),
  solarSourceUrl: z.string().url().optional().or(z.literal('')),
  solarConsultedOn: z.string().optional(),
  performanceRatio: z.number().positive().max(1).optional(),
  costPerKwp: z.number().positive().optional(),
  selfConsumptionFraction: z.number().min(0).max(1).optional(),
  connectionDate: z.string().optional(),
}).passthrough().refine(hasMinimumScenarioInput, {
  message: 'Informe ao menos uma meta de geração, meta de economia, conta mensal ou orçamento.',
});

export const simulationSchema = z.object({
  title: z.string().trim().min(1).max(120),
  inputs: simulationInputSchema,
});

export const referenceUnits = {
  solar_resource: 'kWh/m²/dia',
  performance_ratio: 'fração',
  installed_cost_per_kwp: 'R$/kWp',
  avoided_tariff: 'R$/kWh',
  fio_b_fraction: 'fração',
  gd2_transition_percent: 'fração',
  self_consumption_fraction: 'fração',
};

export const referenceSchema = z.object({
  value: z.number().positive(),
  unit: z.string().min(1).max(32),
  source_name: z.string().min(3).max(190),
  source_url: z.string().url(),
  region: z.string().max(160).optional().default(''),
  consulted_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  limitation: z.string().min(10).max(1000),
});
