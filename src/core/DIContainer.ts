import { TripRepository } from "../repositories/trip.repository";
import { ServiceRepository } from "../repositories/service.repository";
import { UserRepository } from "../repositories/user.repository";
import { FinanceRepository } from "../repositories/finance.repository";
import { TripService } from "../services/trips.service";
import { ServicesService } from "../services/services.service";
import { UserService } from "../services/users.service";
import { FinanceService } from "../services/finance.service";
import { FinanceController } from "../controllers/finance.controller";
import { ServicesController } from "../controllers/services.controller";
import { TripsController } from "../controllers/trips.controller";

class DIContainer {
  private static tripRepository: TripRepository;
  private static serviceRepository: ServiceRepository;
  private static userRepository: UserRepository;
  private static financeRepository: FinanceRepository;

  private static tripService: TripService;
  private static servicesService: ServicesService;
  private static userService: UserService;
  private static financeService: FinanceService;

  private static financeController: FinanceController;
  private static servicesController: ServicesController;
  private static tripsController: TripsController;

  static getTripRepository(): TripRepository {
    if (!this.tripRepository) {
      this.tripRepository = new TripRepository();
    }
    return this.tripRepository;
  }

  static getServiceRepository(): ServiceRepository {
    if (!this.serviceRepository) {
      this.serviceRepository = new ServiceRepository();
    }
    return this.serviceRepository;
  }

  static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository();
    }
    return this.userRepository;
  }

  static getFinanceRepository(): FinanceRepository {
    if (!this.financeRepository) {
      this.financeRepository = new FinanceRepository();
    }
    return this.financeRepository;
  }

  static getTripService(): TripService {
    if (!this.tripService) {
      this.tripService = new TripService(
        this.getTripRepository(),
        this.getServiceRepository()
      );
    }
    return this.tripService;
  }

  static getServicesService(): ServicesService {
    if (!this.servicesService) {
      this.servicesService = new ServicesService(this.getServiceRepository());
    }
    return this.servicesService;
  }

  static getUserService(): UserService {
    if (!this.userService) {
      this.userService = new UserService(this.getUserRepository());
    }
    return this.userService;
  }

  /**
   * Obtener instancia del servicio de finanzas con dependencias inyectadas
   */
  static getFinanceService(): FinanceService {
    if (!this.financeService) {
      this.financeService = new FinanceService(this.getFinanceRepository());
    }
    return this.financeService;
  }

  static getFinanceController(): FinanceController {
    if (!this.financeController) {
      this.financeController = new FinanceController(this.getFinanceService());
    }
    return this.financeController;
  }

  static getServicesController(): ServicesController {
    if (!this.servicesController) {
      this.servicesController = new ServicesController(
        this.getServicesService()
      );
    }
    return this.servicesController;
  }

  static getTripsController(): TripsController {
    if (!this.tripsController) {
      this.tripsController = new TripsController(this.getTripService());
    }
    return this.tripsController;
  }

  static reset(): void {
    this.tripRepository = null as any;
    this.serviceRepository = null as any;
    this.userRepository = null as any;
    this.financeRepository = null as any;
    this.tripService = null as any;
    this.servicesService = null as any;
    this.userService = null as any;
    this.financeService = null as any;
  }
}

export default DIContainer;
