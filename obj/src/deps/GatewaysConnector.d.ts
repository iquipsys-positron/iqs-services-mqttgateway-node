import { ILogger } from 'pip-services-components-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { IGatewaysClientV1 } from 'iqs-clients-gateways-node';
export declare class GatewaysConnector {
    private _logger;
    private _gatewaysClient;
    private _cacheByUdi;
    private _cacheById;
    private _cacheByorgId;
    private _cacheTime;
    private _cacheTimeout;
    constructor(_logger: ILogger, _gatewaysClient: IGatewaysClientV1);
    private clearObsoleteCache;
    private getGatewayFromCacheByUdi;
    private getGatewayFromCacheById;
    private getGatewaysFromCacheByorgId;
    private storeGatewayToCache;
    private storeGatewaysToCache;
    resolveGateway(udi: string, callback: (err: any, gateway: GatewayV1) => void): void;
    findGatewayById(gatewayId: string, callback: (err: any, gateway: GatewayV1) => void): void;
    updateGateway(gateway: GatewayV1): void;
    findGatewaysByorgId(orgId: string, callback: (err: any, gateways: GatewayV1[]) => void): void;
}
