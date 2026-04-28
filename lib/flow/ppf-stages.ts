export const STAGES = ["recepcion", "lavado", "aplicacion", "qc", "entrega", "completado"] as const;
export type Stage = (typeof STAGES)[number];

export const ROLES = ["admin", "tecnico", "especialista", "qc"] as const;
export type Role = (typeof ROLES)[number];

export type StepKey =
  | "orden_servicio"
  | "enviar_autotuning"
  | "lavado_inicial"
  | "descontaminado"
  | "pulido"
  | "lavado_final"
  | "cabina_aplicacion"
  | "detallado"
  | "revision_final"
  | "entrega";

export interface StepDef {
  key: StepKey;
  label: string;
  stage: Stage;
  roleResponsible: Role;
  optional?: boolean;
  /** Only relevant for stage=recepcion when isOfferVehicle=true. */
  conditionalOnOffer?: boolean;
  /** Whether the technician can attach a photo when completing this step. */
  allowsPhoto?: boolean;
}

export const STEPS: StepDef[] = [
  { key: "orden_servicio", label: "Orden de servicio creada", stage: "recepcion", roleResponsible: "admin" },
  {
    key: "enviar_autotuning",
    label: "Enviar a JS Autotuning (laminado + alfombras bandeja)",
    stage: "recepcion",
    roleResponsible: "admin",
    optional: true,
    conditionalOnOffer: true,
  },
  { key: "lavado_inicial", label: "Lavado inicial", stage: "lavado", roleResponsible: "tecnico", allowsPhoto: true },
  { key: "descontaminado", label: "Descontaminado", stage: "lavado", roleResponsible: "tecnico", allowsPhoto: true },
  { key: "pulido", label: "Pulido", stage: "lavado", roleResponsible: "tecnico", allowsPhoto: true },
  { key: "lavado_final", label: "Lavado final", stage: "lavado", roleResponsible: "tecnico", allowsPhoto: true },
  {
    key: "cabina_aplicacion",
    label: "Cabina: aplicación de PPF / Ceramic Coating",
    stage: "aplicacion",
    roleResponsible: "especialista",
    allowsPhoto: true,
  },
  { key: "detallado", label: "Proceso de detallado", stage: "aplicacion", roleResponsible: "especialista", allowsPhoto: true },
  { key: "revision_final", label: "Revisión final", stage: "qc", roleResponsible: "qc", allowsPhoto: true },
  { key: "entrega", label: "Entrega de vehículo", stage: "entrega", roleResponsible: "admin", allowsPhoto: true },
];

export const STAGE_LABELS: Record<Stage, string> = {
  recepcion: "Recepción",
  lavado: "Técnico lavador",
  aplicacion: "Especialista de aplicación",
  qc: "Control de calidad",
  entrega: "Entrega",
  completado: "Completado",
};

/** Versión corta para vistas estrechas (stepper público, badges, etc.). */
export const STAGE_LABELS_SHORT: Record<Stage, string> = {
  recepcion: "Recepción",
  lavado: "Lavado",
  aplicacion: "Aplicación",
  qc: "Calidad",
  entrega: "Entrega",
  completado: "Listo",
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  tecnico: "Técnico lavador",
  especialista: "Especialista de aplicación",
  qc: "Control de calidad",
};

export function stepsForTicket(isOfferVehicle: boolean): StepDef[] {
  return STEPS.filter((s) => !s.conditionalOnOffer || isOfferVehicle);
}

/** Stage that immediately follows the given one in the canonical flow. */
export function nextStage(current: Stage): Stage {
  const idx = STAGES.indexOf(current);
  return STAGES[Math.min(idx + 1, STAGES.length - 1)];
}

/** Compute the stage a ticket should be in given which steps are completed. */
export function deriveStage(
  isOfferVehicle: boolean,
  completedKeys: ReadonlySet<StepKey>,
): Stage {
  const ordered = stepsForTicket(isOfferVehicle);
  for (const stage of STAGES) {
    if (stage === "completado") continue;
    const stageSteps = ordered.filter((s) => s.stage === stage);
    if (stageSteps.length === 0) continue;
    const allDone = stageSteps.every((s) => completedKeys.has(s.key));
    if (!allDone) return stage;
  }
  return "completado";
}

/** Stage → role responsible for advancing it (used for assignment badges & filters). */
export const STAGE_ROLE: Record<Stage, Role | null> = {
  recepcion: "admin",
  lavado: "tecnico",
  aplicacion: "especialista",
  qc: "qc",
  entrega: "admin",
  completado: null,
};

export function progressPercent(
  isOfferVehicle: boolean,
  completedKeys: ReadonlySet<StepKey>,
): number {
  const total = stepsForTicket(isOfferVehicle).length;
  if (total === 0) return 0;
  let done = 0;
  for (const step of stepsForTicket(isOfferVehicle)) {
    if (completedKeys.has(step.key)) done += 1;
  }
  return Math.round((done / total) * 100);
}
