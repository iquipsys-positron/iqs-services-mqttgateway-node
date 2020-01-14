let _ = require('lodash');
let async = require('async');

import { FilterParams } from 'pip-services3-commons-node';
import { ILogger } from 'pip-services3-components-node';
import { NotFoundException } from 'pip-services3-commons-node';
import { InvalidStateException } from 'pip-services3-commons-node';
import { BadRequestException } from 'pip-services3-commons-node';

import { GatewayV1 } from 'iqs-clients-gateways-node';
import { IGatewaysClientV1 } from 'iqs-clients-gateways-node';

export class GatewaysConnector {
    private _cacheByUdi: { [udi: string]: GatewayV1 } = {};
    private _cacheById: { [id: string]: GatewayV1 } = {};
    private _cacheByorgId: { [id: string]: GatewayV1[] } = {};
    private _cacheTime: Date = new Date();
    private _cacheTimeout: number = 15000;

    public constructor(
        private _logger: ILogger,
        private _gatewaysClient: IGatewaysClientV1
    ) {}

    private clearObsoleteCache() {
        let now = new Date();
        let elapsed = now.getTime() - this._cacheTime.getTime();
        if (elapsed > this._cacheTimeout) {
            this._cacheByUdi = {};
            this._cacheById = {};
            this._cacheByorgId = {};
            this._cacheTime = now;
        }
    }

    private getGatewayFromCacheByUdi(udi: string): GatewayV1 {
        this.clearObsoleteCache();
        return this._cacheByUdi[udi];
    }

    private getGatewayFromCacheById(id: string): GatewayV1 {
        this.clearObsoleteCache();
        return this._cacheById[id];
    }

    private getGatewaysFromCacheByorgId(id: string): GatewayV1[] {
        this.clearObsoleteCache();
        return this._cacheByorgId[id];
    }

    private storeGatewayToCache(gateway: GatewayV1): void {
        if (gateway) {
            this.clearObsoleteCache();
            this._cacheByUdi[gateway.udi] = gateway;
            this._cacheById[gateway.id] = gateway;
        }
    }

    private storeGatewaysToCache(orgId: string, gateways: GatewayV1[]): void {
        if (gateways && gateways.length > 0) {
            this.clearObsoleteCache();
            this._cacheByorgId[orgId] = gateways;
        }
    }
    
    public resolveGateway(udi: string, callback: (err: any, gateway: GatewayV1) => void): void {
        if (udi == null) {
            callback(
                new BadRequestException(
                    'mqtt-gateway',
                    'NO_GW_UDI',
                    'Gateway UDI is not defined'
                ),
                null
            );
            return;
        }

        // Retrieve from cache
        let gateway = this.getGatewayFromCacheByUdi(udi);
        if (gateway) {
            callback(null, gateway);
            return;
        }
        
        this._gatewaysClient.getGatewayByUdi(
            'mqtt-gateway',
            udi,
            (err, gateway) => {
                if (err == null && gateway == null) {
                    err = new NotFoundException(
                        'mqtt-gateway',
                        'GW_NOT_FOUND',
                        'Gateway ' + udi + ' was not found'
                    ).withDetails('udi', udi);
                }

                if (err == null && gateway && !gateway.active) {
                    err = new InvalidStateException(
                        'mqtt-gateway',
                        'GW_INACTIVE',
                        'Gateway ' + udi + ' is inactive'
                    ).withDetails('udi', udi);
                }

                this.storeGatewayToCache(gateway);

                callback(err, gateway);
            }
        );
    }

    public findGatewayById(gatewayId: string,
        callback: (err: any, gateway: GatewayV1) => void): void {

        // Retrieve from cache
        let gateway = this.getGatewayFromCacheById(gatewayId);
        if (gateway) {
            callback(null, gateway);
            return;
        }
            
        this._gatewaysClient.getGatewayById(
            'mqtt-gateway',
            gatewayId,
            (err, gateway) => {
                this.storeGatewayToCache(gateway);

                callback(err, gateway);
            }
        );
    }

    public updateGateway(gateway: GatewayV1): void {
        if (gateway == null) return;

        this._gatewaysClient.updateGateway(
            'mqtt-gateway',
            gateway,
            (err, gateway) => {
                this.storeGatewayToCache(gateway);

                if (err) this._logger.error('mqtt-gateway', err, 'Failed to update gateway info');
            }
        )
    }
    
    public findGatewaysByorgId(orgId: string,
        callback: (err: any, gateways: GatewayV1[]) => void): void {
        
        // Retrieve from cache
        let gateways = this.getGatewaysFromCacheByorgId(orgId);
        if (gateways) {
            callback(null, gateways);
            return;
        }

        this._gatewaysClient.getGateways(
            'mqtt-gateway',
            FilterParams.fromTuples(
                'org_id', orgId,
                'active', true
            ),
            null,
            (err, page) => {
                if (page)
                    gateways = page.data;

                this.storeGatewaysToCache(orgId, gateways);

                callback(err, gateways);
            }
        )
    }

}