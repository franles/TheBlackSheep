import { TripRepository } from "../repositories/trip.repository";
import { ServiceRepository } from "../repositories/service.repository";
import { UserRepository } from "../repositories/user.repository";
import { FinanceRepository } from "../repositories/finance.repository";
import { TripService } from "../services/trips.service";
import { ServicesService } from "../services/services.service";
import { UserService } from "../services/users.service";
import { FinanceService } from "../services/finance.service";

/**
 * Contenedor de inyección de dependencias
 * Maneja la creación e inyección de todas las dependencias del sistema
 */
class DIContainer {
  // Repositorios (Singleton)
  private static tripRepository: TripRepository;
  private static serviceRepository: ServiceRepository;
  private static userRepository: UserRepository;
  private static financeRepository: FinanceRepository;

  // Servicios (Singleton)
  private static tripService: TripService;
  private static servicesService: ServicesService;
  private static userService: UserService;
  private static financeService: FinanceService;

  /**
   * Obtener instancia del repositorio de viajes
   */
  static getTripRepository(): TripRepository {
    if (!this.tripRepository) {
      this.tripRepository = new TripRepository();
    }
    return this.tripRepository;
  }

  /**
   * Obtener instancia del repositorio de servicios
   */
  static getServiceRepository(): ServiceRepository {
    if (!this.serviceRepository) {
      this.serviceRepository = new ServiceRepository();
    }
    return this.serviceRepository;
  }

  /**
   * Obtener instancia del repositorio de usuarios
   */
  static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository();
    }
    return this.userRepository;
  }

  /**
   * Obtener instancia del repositorio de finanzas
   */
  static getFinanceRepository(): FinanceRepository {
    if (!this.financeRepository) {
      this.financeRepository = new FinanceRepository();
    }
    return this.financeRepository;
  }

  /**
   * Obtener instancia del servicio de viajes con dependencias inyectadas
   */
  static getTripService(): TripService {
    if (!this.tripService) {
      this.tripService = new TripService(
        this.getTripRepository(),
        this.getServiceRepository()
      );
    }
    return this.tripService;
  }

  /**
   * Obtener instancia del servicio de servicios con dependencias inyectadas
   */
  static getServicesService(): ServicesService {
    if (!this.servicesService) {
      this.servicesService = new ServicesService(this.getServiceRepository());
    }
    return this.servicesService;
  }

  /**
   * Obtener instancia del servicio de usuarios con dependencias inyectadas
   */
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

  /**
   * Resetear todas las instancias (útil para testing)
   */
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
