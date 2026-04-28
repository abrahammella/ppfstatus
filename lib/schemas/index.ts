import { z } from "zod";
import { ROLES, STAGES, type StepKey } from "@/lib/flow/ppf-stages";

const id = z.string().min(1);
const isoDate = z.string().datetime({ offset: true });

export const RoleSchema = z.enum(ROLES);
export const StageSchema = z.enum(STAGES);

export const UserSchema = z.object({
  id,
  email: z.string().email(),
  passwordHash: z.string().min(1),
  role: RoleSchema,
  name: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  active: z.boolean().default(true),
  createdAt: isoDate,
});
export type User = z.infer<typeof UserSchema>;
export type PublicUser = Omit<User, "passwordHash">;

export const ClientSchema = z.object({
  id,
  fullName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional(),
  notes: z.string().optional(),
  createdAt: isoDate,
  lastVisitAt: isoDate.optional(),
});
export type Client = z.infer<typeof ClientSchema>;

export const VehicleSchema = z.object({
  id,
  clientId: id,
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1980).max(2100),
  plate: z.string().min(1),
  color: z.string().min(1),
  vin: z.string().optional(),
});
export type Vehicle = z.infer<typeof VehicleSchema>;

export const StepKeySchema: z.ZodType<StepKey> = z.enum([
  "orden_servicio",
  "enviar_autotuning",
  "lavado_inicial",
  "descontaminado",
  "pulido",
  "lavado_final",
  "cabina_aplicacion",
  "detallado",
  "revision_final",
  "entrega",
]);

export const TicketStepSchema = z.object({
  key: StepKeySchema,
  completed: z.boolean(),
  completedBy: id.optional(),
  completedAt: isoDate.optional(),
  photoUrl: z.string().optional(),
  notes: z.string().optional(),
});
export type TicketStep = z.infer<typeof TicketStepSchema>;

export const ServiceTypeSchema = z.enum(["PPF", "CeramicCoating", "Both"]);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

export const CatalogCategorySchema = z.enum([
  "paquete_ppf",
  "ceramic_coating",
  "lavado",
  "otro",
]);
export type CatalogCategory = z.infer<typeof CatalogCategorySchema>;

export const CatalogItemSchema = z.object({
  id,
  name: z.string().min(2),
  category: CatalogCategorySchema,
  active: z.boolean().default(true),
  priceUsd: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});
export type CatalogItem = z.infer<typeof CatalogItemSchema>;

export const CatalogItemInputSchema = CatalogItemSchema.omit({ id: true });

export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  paquete_ppf: "Paquete PPF",
  ceramic_coating: "Ceramic Coating",
  lavado: "Lavados Profesionales",
  otro: "Otros Servicios",
};

export const CATEGORY_ORDER: CatalogCategory[] = [
  "paquete_ppf",
  "ceramic_coating",
  "lavado",
  "otro",
];

export const TicketSchema = z.object({
  id,
  vehicleId: id,
  clientId: id,
  isOfferVehicle: z.boolean(),
  serviceType: ServiceTypeSchema,
  catalogItemIds: z.array(id).default([]),
  status: StageSchema,
  steps: z.array(TicketStepSchema),
  assignedTecnicoId: id.optional(),
  assignedEspecialistaId: id.optional(),
  assignedQcId: id.optional(),
  createdAt: isoDate,
  etaAt: isoDate,
  completedAt: isoDate.optional(),
  publicToken: z.string().min(8),
});
export type Ticket = z.infer<typeof TicketSchema>;

export const ServiceSchema = z.object({
  id,
  vehicleId: id,
  clientId: id,
  ticketId: id,
  type: ServiceTypeSchema,
  catalogItemIds: z.array(id).default([]),
  completedAt: isoDate,
  notes: z.string().optional(),
});
export type Service = z.infer<typeof ServiceSchema>;

// ---- Form schemas (input from UI) ----

export const ClientInputSchema = ClientSchema.omit({ id: true, createdAt: true, lastVisitAt: true });
export const VehicleInputSchema = VehicleSchema.omit({ id: true });
export const UserInputSchema = UserSchema.omit({ id: true, passwordHash: true, createdAt: true }).extend({
  password: z.string().min(8),
});

export const NewTicketInputSchema = z.object({
  clientId: id,
  vehicleId: id,
  serviceType: ServiceTypeSchema,
  catalogItemIds: z.array(id).default([]),
  isOfferVehicle: z.boolean(),
  etaAt: isoDate,
  assignedTecnicoId: id.optional(),
  assignedEspecialistaId: id.optional(),
  assignedQcId: id.optional(),
});
export type NewTicketInput = z.infer<typeof NewTicketInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;
