"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require('lodash');
const async = require('async');
const MessageProcessor_1 = require("./MessageProcessor");
const StateUpdateMessage2_1 = require("../protocol/StateUpdateMessage2");
const FilterParams_1 = require("pip-services-commons-node/obj/src/data/FilterParams");
const DeviceStatusV1_1 = require("iqs-clients-devices-node/obj/src/version1/DeviceStatusV1");
class StateProcessor2 extends MessageProcessor_1.MessageProcessor {
    processMessage(gateway, device, message, callback) {
        if (message instanceof StateUpdateMessage2_1.StateUpdateMessage2) {
            this.processStateUpdateMessage(gateway, device, message, callback);
        }
        else {
            callback(null);
        }
    }
    createStateUpdate(device, message) {
        let stateUpdate = {
            org_id: null,
            device_id: null,
            time: new Date(),
            freezed: this.calculateFreezed(message),
            pressed: this.calculatePressed(message),
            long_pressed: this.calculateLongPressed(message),
            power: this.calculatePowered(message),
            params: message.params,
            events: message.events,
            beacons: message.beacons
        };
        if (device != null) {
            stateUpdate.org_id = device.org_id;
            stateUpdate.device_id = device.id;
        }
        if (message.lat != 0 && message.lng != 0) {
            stateUpdate.lat = message.lat;
            stateUpdate.lng = message.lng;
            stateUpdate.alt = message.alt;
            stateUpdate.angle = message.angle;
            stateUpdate.speed = message.speed;
        }
        return stateUpdate;
    }
    calculatePowered(message) {
        let params = message.params || [];
        for (let param of params) {
            if (param.id == 1)
                return param.val > 0;
        }
        return false;
    }
    calculateFreezed(message) {
        let params = message.params || [];
        for (let param of params) {
            if (param.id == 2)
                return param.val > 0;
        }
        return false;
    }
    calculatePressed(message) {
        let events = message.events || [];
        for (let event of events) {
            if (event.id == 1)
                return event.val > 0;
        }
        return false;
    }
    calculateLongPressed(message) {
        let events = message.events || [];
        for (let event of events) {
            if (event.id == 2)
                return event.val > 0;
        }
        return false;
    }
    resolveBeacons(message, callback) {
        // Skip if beacons are not set
        if (message.beacons == null || message.beacons.length == 0) {
            callback(null, []);
            return;
        }
        let filter = FilterParams_1.FilterParams.fromTuples('org_id', message.org_id, 'udis', message.beacons);
        // Get beacons by organization (optional) and udis
        this._dependencies.beaconsClient.getBeacons(this._correlationId, filter, null, (err, page) => {
            let beacons = page ? page.data : [];
            callback(err, beacons);
        });
    }
    clarifyDevice(message, stateUpdate, beacons, callback) {
        // Skip if device is already defined
        if (stateUpdate.device_id != null) {
            callback(null);
            return;
        }
        // Skip if there are no beacons
        if (beacons == null || beacons.length == 0) {
            callback(null);
            return;
        }
        // Define all possible organization ids
        let orgIds;
        if (message.org_id != '') {
            orgIds = [message.org_id];
        }
        else {
            orgIds = _.map(beacons, b => b.org_id);
            orgIds = _.uniq(orgIds);
        }
        let filter = FilterParams_1.FilterParams.fromTuples('org_ids', orgIds, 'udi', message.device_udi);
        // Find device by udi and organization ids
        this._dependencies.devicesClient.getDevices(this._correlationId, filter, null, (err, page) => {
            if (page != null && page.data.length > 0) {
                let device = page.data[0];
                stateUpdate.org_id = device.org_id;
                stateUpdate.device_id = device.id;
            }
            callback(err);
        });
    }
    calculateBeaconsPosition(stateUpdate, beacons) {
        // If position is already defined then skip
        //if (stateUpdate.lat != null && stateUpdate.lng != null) return
        // If beacons are not set then skip
        if (beacons == null || beacons.length == 0)
            return;
        // All beacons must be from the same organization
        beacons = _.filter(beacons, b => b.org_id = stateUpdate.org_id);
        let lat = 0;
        let lng = 0;
        let count = 0;
        // Calculate middle between beacon positions
        for (let beacon of beacons) {
            if (beacon.center && beacon.center.type == 'Point'
                && _.isArray(beacon.center.coordinates)) {
                lng += beacon.center.coordinates[0];
                lat += beacon.center.coordinates[1];
                count += 1;
            }
        }
        // Assign calculated position
        if (count > 0) {
            stateUpdate.lat = lat / count;
            stateUpdate.lng = lng / count;
        }
    }
    processStateUpdateMessage(gateway, device, message, callback) {
        // Skip if device isn't active
        if (device && device.status != DeviceStatusV1_1.DeviceStatusV1.Active) {
            callback();
            return;
        }
        let stateUpdate = this.createStateUpdate(device, message);
        let beacons;
        async.series([
            (callback) => {
                this.resolveBeacons(message, (err, data) => {
                    beacons = data;
                    callback(err);
                });
            },
            (callback) => {
                this.clarifyDevice(message, stateUpdate, beacons, callback);
            },
            (callback) => {
                this.calculateBeaconsPosition(stateUpdate, beacons);
                callback();
            },
            (callback) => {
                // Skip if device hasn't been defined
                if (stateUpdate.device_id == null) {
                    callback();
                    return;
                }
                this._dependencies.logger.debug(this._correlationId, "Processed status msg from %s : %s", stateUpdate.org_id, message.device_udi);
                this._dependencies.statesClient.beginUpdateState(this._correlationId, stateUpdate, callback);
            }
        ], callback);
    }
}
exports.StateProcessor2 = StateProcessor2;
//# sourceMappingURL=StateProcessor2.js.map