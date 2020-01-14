"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
class GatewaysConnector {
    constructor(_logger, _gatewaysClient) {
        this._logger = _logger;
        this._gatewaysClient = _gatewaysClient;
        this._cacheByUdi = {};
        this._cacheById = {};
        this._cacheByorgId = {};
        this._cacheTime = new Date();
        this._cacheTimeout = 15000;
    }
    clearObsoleteCache() {
        let now = new Date();
        let elapsed = now.getTime() - this._cacheTime.getTime();
        if (elapsed > this._cacheTimeout) {
            this._cacheByUdi = {};
            this._cacheById = {};
            this._cacheByorgId = {};
            this._cacheTime = now;
        }
    }
    getGatewayFromCacheByUdi(udi) {
        this.clearObsoleteCache();
        return this._cacheByUdi[udi];
    }
    getGatewayFromCacheById(id) {
        this.clearObsoleteCache();
        return this._cacheById[id];
    }
    getGatewaysFromCacheByorgId(id) {
        this.clearObsoleteCache();
        return this._cacheByorgId[id];
    }
    storeGatewayToCache(gateway) {
        if (gateway) {
            this.clearObsoleteCache();
            this._cacheByUdi[gateway.udi] = gateway;
            this._cacheById[gateway.id] = gateway;
        }
    }
    storeGatewaysToCache(orgId, gateways) {
        if (gateways && gateways.length > 0) {
            this.clearObsoleteCache();
            this._cacheByorgId[orgId] = gateways;
        }
    }
    resolveGateway(udi, callback) {
        if (udi == null) {
            callback(new pip_services3_commons_node_4.BadRequestException('mqtt-gateway', 'NO_GW_UDI', 'Gateway UDI is not defined'), null);
            return;
        }
        // Retrieve from cache
        let gateway = this.getGatewayFromCacheByUdi(udi);
        if (gateway) {
            callback(null, gateway);
            return;
        }
        this._gatewaysClient.getGatewayByUdi('mqtt-gateway', udi, (err, gateway) => {
            if (err == null && gateway == null) {
                err = new pip_services3_commons_node_2.NotFoundException('mqtt-gateway', 'GW_NOT_FOUND', 'Gateway ' + udi + ' was not found').withDetails('udi', udi);
            }
            if (err == null && gateway && !gateway.active) {
                err = new pip_services3_commons_node_3.InvalidStateException('mqtt-gateway', 'GW_INACTIVE', 'Gateway ' + udi + ' is inactive').withDetails('udi', udi);
            }
            this.storeGatewayToCache(gateway);
            callback(err, gateway);
        });
    }
    findGatewayById(gatewayId, callback) {
        // Retrieve from cache
        let gateway = this.getGatewayFromCacheById(gatewayId);
        if (gateway) {
            callback(null, gateway);
            return;
        }
        this._gatewaysClient.getGatewayById('mqtt-gateway', gatewayId, (err, gateway) => {
            this.storeGatewayToCache(gateway);
            callback(err, gateway);
        });
    }
    updateGateway(gateway) {
        if (gateway == null)
            return;
        this._gatewaysClient.updateGateway('mqtt-gateway', gateway, (err, gateway) => {
            this.storeGatewayToCache(gateway);
            if (err)
                this._logger.error('mqtt-gateway', err, 'Failed to update gateway info');
        });
    }
    findGatewaysByorgId(orgId, callback) {
        // Retrieve from cache
        let gateways = this.getGatewaysFromCacheByorgId(orgId);
        if (gateways) {
            callback(null, gateways);
            return;
        }
        this._gatewaysClient.getGateways('mqtt-gateway', pip_services3_commons_node_1.FilterParams.fromTuples('org_id', orgId, 'active', true), null, (err, page) => {
            if (page)
                gateways = page.data;
            this.storeGatewaysToCache(orgId, gateways);
            callback(err, gateways);
        });
    }
}
exports.GatewaysConnector = GatewaysConnector;
//# sourceMappingURL=GatewaysConnector.js.map