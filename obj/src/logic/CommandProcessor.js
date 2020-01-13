"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const MessageProcessor_1 = require("./MessageProcessor");
const CommandMessage_1 = require("../protocol/CommandMessage");
class CommandProcessor extends MessageProcessor_1.MessageProcessor {
    sendCommands(correlationId, orgId, deviceId, values, timestamp, callback) {
        this._dependencies.devicesConnector.findDeviceById(deviceId, (err, device) => {
            if (err == null)
                err = this.validateDevice(deviceId, device);
            if (err == null && device)
                this.sendCommandMessages(correlationId, orgId, [device], values, timestamp, callback);
            else if (callback)
                callback(err, false);
        });
    }
    broadcastCommands(correlationId, orgId, values, timestamp, callback) {
        this._dependencies.devicesConnector.getDevicesByorgId(orgId, (err, devices) => {
            if (devices != null)
                devices = _.filter(devices, d => this.validateDevice(d.udi, d) == null);
            if (err == null && devices)
                this.sendCommandMessages(correlationId, orgId, devices, values, timestamp, callback);
            else if (callback)
                callback(err, false);
        });
    }
    sendCommandMessages(correlationId, orgId, devices, values, timestamp, callback) {
        let gateways = [];
        let result = false;
        async.series([
            // Find all gateways for specified organization
            (callback) => {
                this._dependencies.gatewaysConnector.findGatewaysByorgId(orgId, (err, data) => {
                    gateways = data;
                    callback(err);
                });
            },
            // Send messages to all devices throught all organizations
            (callback) => {
                let message = new CommandMessage_1.CommandMessage();
                message.org_id = orgId;
                message.commands = values;
                message.timestamp = timestamp || new Date().getTime() / 1000;
                for (let device of devices) {
                    message.gw_udi = null;
                    message.device_udi = device.udi;
                    this._dependencies.logger.debug(correlationId, "Sending command msg to %s : %s", device.org_id, device.udi);
                    // Send directly to device
                    this.sendMessage(device.udi, message);
                    // Send through gateways
                    for (let gateway of gateways) {
                        message.gw_udi = gateway.udi;
                        this.sendMessage(gateway.udi, message);
                        result = true;
                    }
                }
                callback();
            }
        ], (err) => {
            if (callback)
                callback(err, err == null ? result : null);
        });
    }
}
exports.CommandProcessor = CommandProcessor;
//# sourceMappingURL=CommandProcessor.js.map