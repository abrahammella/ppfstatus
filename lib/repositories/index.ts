import "server-only";
import type { Repos } from "./interfaces";
import { jsonClientRepo } from "./json/client.repo";
import { jsonServiceRepo } from "./json/service.repo";
import { jsonTicketRepo } from "./json/ticket.repo";
import { jsonUserRepo } from "./json/user.repo";
import { jsonVehicleRepo } from "./json/vehicle.repo";

const driver = process.env.REPO_DRIVER ?? "json";

function build(): Repos {
  switch (driver) {
    case "json":
      return {
        users: jsonUserRepo,
        clients: jsonClientRepo,
        vehicles: jsonVehicleRepo,
        tickets: jsonTicketRepo,
        services: jsonServiceRepo,
      };
    case "supabase":
      throw new Error("Supabase driver not implemented yet (Fase 2).");
    default:
      throw new Error(`Unknown REPO_DRIVER: ${driver}`);
  }
}

export const repos: Repos = build();
