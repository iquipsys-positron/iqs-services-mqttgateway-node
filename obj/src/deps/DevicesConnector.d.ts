import { ILogger } from 'pip-services3-components-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { IDevicesClientV1 } from 'iqs-clients-devices-node';
export declare class DevicesConnector {
    private _logger;
    private _devicesClient;
    private _cacheByUdi;
    private _cacheById;
    private _cacheTime;
    private _cacheTimeout;
    constructor(_logger: ILogger, _devicesClient: IDevicesClientV1);
    private clearObsoleteCache;
    private getDeviceFromCacheByUdi;
    private getDeviceFromCacheById;
    private storeDeviceToCache;
    resolveDeviceWithoutorgId(udi: string, callback: (err: any, device: DeviceV1) => void): void;
    resolveDevice(orgId: string, udi: string, callback: (err: any, device: DeviceV1) => void): void;
    findDeviceById(deviceId: string, callback: (err: any, device: DeviceV1) => void): void;
    getDevicesByorgId(orgId: string, callback: (err: any, devices: DeviceV1[]) => void): void;
    updateDevice(device: DeviceV1): void;
}
