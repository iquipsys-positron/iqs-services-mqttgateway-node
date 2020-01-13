"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const MessageProcessor_1 = require("./MessageProcessor");
const DeviceInitMessage_1 = require("../protocol/DeviceInitMessage");
const StateUpdateMessage_1 = require("../protocol/StateUpdateMessage");
const StateUpdateMessage2_1 = require("../protocol/StateUpdateMessage2");
const OrganizationInfoMessage_1 = require("../protocol/OrganizationInfoMessage");
class OrganizationInfoProcessor extends MessageProcessor_1.MessageProcessor {
    constructor() {
        super(...arguments);
        this._organizationInfoTickets = {};
    }
    processMessage(gateway, device, message, callback) {
        if (message instanceof DeviceInitMessage_1.DeviceInitMessage) {
            let deviceInitMessage = message;
            let organizationVersion = deviceInitMessage.data_version;
            let deviceUdi = deviceInitMessage.device_udi;
            this.processOrganizationInfoMessage(gateway, device, deviceUdi, organizationVersion, callback);
        }
        else if (message instanceof StateUpdateMessage_1.StateUpdateMessage) {
            let stateUpdateMessage = message;
            let organizationVersion = stateUpdateMessage.data_version;
            let deviceUdi = stateUpdateMessage.device_udi;
            this.processOrganizationInfoMessage(gateway, device, deviceUdi, organizationVersion, callback);
        }
        else if (message instanceof StateUpdateMessage2_1.StateUpdateMessage2) {
            let stateUpdateMessage = message;
            let organizationVersion = stateUpdateMessage.data_version;
            let deviceUdi = stateUpdateMessage.device_udi;
            this.processOrganizationInfoMessage(gateway, device, deviceUdi, organizationVersion, callback);
        }
        else {
            callback(null);
        }
    }
    processOrganizationInfoMessage(gateway, device, deviceUdi, organizationVersion, callback) {
        // Skip if device wasn't identified
        if (device == null) {
            callback(null);
            return;
        }
        let organization;
        async.series([
            // Validate device
            (callback) => {
                this.validateDevice(deviceUdi, device, callback);
            },
            // Find organization
            (callback) => {
                this._dependencies.organizationsConnector.findOrganizationById(device.org_id, (err, data) => {
                    organization = data;
                    callback(null);
                });
            },
            // Send organization info
            (callback) => {
                if (organization && organization.version != organizationVersion)
                    this.sendOrganizationInfoMessage(gateway, device, organization);
                callback();
            }
        ], callback);
    }
    sendOrganizationInfoMessage(gateway, device, organization) {
        // Prevent flooding with info messages
        let ticket = this._organizationInfoTickets[device.udi];
        let now = new Date().getTime();
        if (ticket && now - ticket < 300000)
            return;
        this._organizationInfoTickets[device.udi] = now;
        let message = new OrganizationInfoMessage_1.OrganizationInfoMessage();
        message.org_id = organization.id;
        message.gw_udi = gateway != null ? gateway.udi : null;
        message.device_udi = device.udi;
        message.time = new Date();
        let currentOrganizationVersion = organization.version && organization.version > 0 ? organization.version : 1;
        message.data_version = currentOrganizationVersion;
        let center = organization.center && organization.center.coordinates ? organization.center : null;
        message.center_lng = center ? center.coordinates[0] : 0;
        message.center_lat = center ? center.coordinates[1] : 0;
        message.radius = organization.radius || 10;
        if (organization.params) {
            message.active_int = organization.params['active_int'] || 60;
            message.inactive_int = organization.params['inactive_int'] || 300;
            message.offsite_int = organization.params['offsite_int'] || 900;
            message.data_rate = organization.params['data_rate'] || 3;
        }
        this._dependencies.logger.debug(this._correlationId, "Sending organization info msg to %s : %s", device.org_id, device.udi);
        // Send to gateway or to device directly
        let udi = message.gw_udi || message.device_udi;
        this.sendMessage(udi, message);
    }
}
exports.OrganizationInfoProcessor = OrganizationInfoProcessor;
//# sourceMappingURL=OrganizationInfoProcessor.js.map