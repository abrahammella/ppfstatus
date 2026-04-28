import type { CatalogItem, Client, Service, Ticket, User, Vehicle } from "@/lib/schemas";

export interface IUserRepo {
  list(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, patch: Partial<User>): Promise<User>;
  remove(id: string): Promise<void>;
}

export interface IClientRepo {
  list(): Promise<Client[]>;
  findById(id: string): Promise<Client | null>;
  create(client: Client): Promise<Client>;
  update(id: string, patch: Partial<Client>): Promise<Client>;
  remove(id: string): Promise<void>;
}

export interface IVehicleRepo {
  list(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  listByClient(clientId: string): Promise<Vehicle[]>;
  create(v: Vehicle): Promise<Vehicle>;
  update(id: string, patch: Partial<Vehicle>): Promise<Vehicle>;
  remove(id: string): Promise<void>;
}

export interface ITicketRepo {
  list(): Promise<Ticket[]>;
  findById(id: string): Promise<Ticket | null>;
  findByPublicToken(token: string): Promise<Ticket | null>;
  create(ticket: Ticket): Promise<Ticket>;
  update(id: string, patch: Partial<Ticket>): Promise<Ticket>;
  remove(id: string): Promise<void>;
}

export interface IServiceRepo {
  list(): Promise<Service[]>;
  listByVehicle(vehicleId: string): Promise<Service[]>;
  listByClient(clientId: string): Promise<Service[]>;
  create(s: Service): Promise<Service>;
}

export interface ICatalogRepo {
  list(): Promise<CatalogItem[]>;
  findById(id: string): Promise<CatalogItem | null>;
  create(item: CatalogItem): Promise<CatalogItem>;
  update(id: string, patch: Partial<CatalogItem>): Promise<CatalogItem>;
  remove(id: string): Promise<void>;
}

export interface Repos {
  users: IUserRepo;
  clients: IClientRepo;
  vehicles: IVehicleRepo;
  tickets: ITicketRepo;
  services: IServiceRepo;
  catalog: ICatalogRepo;
}
