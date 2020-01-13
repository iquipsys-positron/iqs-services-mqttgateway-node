"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const iqs_clients_devices_node_1 = require("iqs-clients-devices-node");
const iqs_clients_devices_node_2 = require("iqs-clients-devices-node");
class DevicesConnector {
    constructor(_logger, _devicesClient) {
        this._logger = _logger;
        this._devicesClient = _devicesClient;
        this._cacheByUdi = {};
        this._cacheById = {};
        this._cacheTime = new Date();
        this._cacheTimeout = 15000;
    }
    clearObsoleteCache() {
        let now = new Date();
        let elapsed = now.getTime() - this._cacheTime.getTime();
        if (elapsed > this._cacheTimeout) {
            this._cacheByUdi = {};
            this._cacheById = {};
            this._cacheTime = now;
        }
    }
    getDeviceFromCacheByUdi(orgId, udi) {
        this.clearObsoleteCache();
        if (orgId)
            return this._cacheByUdi[orgId + '_' + udi];
        else
            return this._cacheByUdi[udi];
    }
    getDeviceFromCacheById(id) {
        this.clearObsoleteCache();
        return this._cacheById[id];
    }
    storeDeviceToCache(device) {
        if (device) {
            this.clearObsoleteCache();
            if (device.org_id) {
                this._cacheByUdi[device.org_id + '_' + device.udi] = device;
            }
            else {
                this._cacheByUdi[device.udi] = device;
            }
            this._cacheById[device.id] = device;
        }
    }
    resolveDeviceWithoutorgId(udi, callback) {
        if (udi == '') {
            callback(new pip_services_commons_node_2.BadRequestException('teltonika-gateway', 'NO_DEVICE_UDI', 'Device UDI is not defined'), null);
            return;
        }
        // Retrieve from cache
        udi = udi.toLowerCase();
        let device = this.getDeviceFromCacheByUdi(null, udi);
        if (device != null) {
            callback(null, device);
            return;
        }
        let filter = pip_services_commons_node_1.FilterParams.fromTuples('udi', udi, 'status', iqs_clients_devices_node_2.DeviceStatusV1.Active);
        this._devicesClient.getDevices('mqtt-gateway', filter, null, (err, page) => {
            let devices = page != null ? page.data : null;
            this.storeDeviceToCache(devices[0]);
            callback(err, devices[0]);
        });
    }
    resolveDevice(orgId, udi, callback) {
        if (orgId == '') {
            callback(new pip_services_commons_node_2.BadRequestException('mqtt-gateway', 'UNKNOWN_SITE', 'Cannot determine organization'), null);
            return;
        }
        if (udi == '') {
            callback(new pip_services_commons_node_2.BadRequestException('mqtt-gateway', 'NO_DEVICE_UDI', 'Device UDI is not defined'), null);
            return;
        }
        // Retrieve from cache
        let device = this.getDeviceFromCacheByUdi(orgId, udi);
        if (device) {
            callback(null, device);
            return;
        }
        this._devicesClient.getOrCreateDevice('mqtt-gateway', orgId, iqs_clients_devices_node_1.DeviceTypeV1.Unknown, null, udi, (err, device) => {
            // if (err == null && device && device.status != DeviceStatusV1.Active) {
            //     err = new InvalidStateException(
            //         'mqtt-gateway',
            //         'DEVICE_INACTIVE',
            //         'Device ' + udi + ' is inactive'
            //     ).withDetails('udi', udi);
            // }
            this.storeDeviceToCache(device);
            callback(err, device);
        });
    }
    findDeviceById(deviceId, callback) {
        // Retrieve from cache
        let device = this.getDeviceFromCacheById(deviceId);
        if (device) {
            callback(null, device);
            return;
        }
        this._devicesClient.getDeviceById('mqtt-gateway', deviceId, (err, device) => {
            this.storeDeviceToCache(device);
            callback(err, device);
        });
    }
    getDevicesByorgId(orgId, callback) {
        this._devicesClient.getDevices('mqtt-gateway', pip_services_commons_node_1.FilterParams.fromTuples('org_id', orgId, 'status', iqs_clients_devices_node_2.DeviceStatusV1.Active), null, (err, page) => {
            let devices = page ? page.data : null;
            callback(err, devices);
        });
    }
    // Operation is performed asynchronously
    updateDevice(device) {
        if (device == null)
            return;
        this._devicesClient.updateDevice('mqtt-gateway', device, (err, device) => {
            this.storeDeviceToCache(device);
            if (err)
                this._logger.error('mqtt-gateway', err, 'Failed to update device info');
        });
    }
}
exports.DevicesConnector = DevicesConnector;
//# sourceMappingURL=DevicesConnector.js.map