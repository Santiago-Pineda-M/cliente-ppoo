import type { IUseCase, ResultType } from '@/Domain';
import type { ConductorVehiculoItemType } from '@/Domain/Entities/ConductorVehiculo';
import type {
  AssociateVehiculosCommandType,
  ChangeConductorEstadoCommandType,
  IConductorApiService,
} from '@/Application/Services/IConductorApiService';

export class AssociateVehiculosUseCase implements IUseCase<AssociateVehiculosCommandType, ConductorVehiculoItemType[]> {
  constructor(private readonly conductoresApi: IConductorApiService) {}

  async execute(cmd: AssociateVehiculosCommandType): Promise<ResultType<ConductorVehiculoItemType[]>> {
    return this.conductoresApi.associate(cmd);
  }
}

export class ChangeConductorEstadoUseCase implements IUseCase<ChangeConductorEstadoCommandType, void> {
  constructor(private readonly conductoresApi: IConductorApiService) {}

  async execute(cmd: ChangeConductorEstadoCommandType): Promise<ResultType<void>> {
    return this.conductoresApi.changeEstado(cmd);
  }
}
