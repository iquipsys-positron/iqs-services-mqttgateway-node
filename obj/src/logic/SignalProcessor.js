"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const MessageProcessor_1 = require("./MessageProcessor");
const SignalMessage_1 = require("../protocol/SignalMessage");
class SignalProcessor extends MessageProcessor_1.MessageProcessor {
    sendSignal(correlationId, orgId, deviceId, signal, timestamp, callback) {
        this._dependencies.devicesConnector.findDeviceById(deviceId, (err, device) => {
            if (err == null)
                err = this.validateDevice(deviceId, device);
            if (err == null && device)
                this.sendSignalMessages(correlationId, orgId, [device], signal, timestamp, callback);
            else if (callback)
                callback(err, false);
        });
    }
    broadcastSignal(correlationId, orgId, signal, timestamp, callback) {
        this._dependencies.devicesConnector.getDevicesByorgId(orgId, (err, devices) => {
            if (devices != null)
                devices = _.filter(devices, d => this.validateDevice(d.udi, d) == null);
            if (err == null && devices)
                this.sendSignalMessages(correlationId, orgId, devices, signal, timestamp, callback);
            else if (callback)
                callback(err, false);
        });
    }
    sendSignalMessages(correlationId, orgId, devices, signal, timestamp, callback) {
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
                let message = new SignalMessage_1.SignalMessage();
                message.org_id = orgId;
                message.signal = signal;
                message.timestamp = timestamp || new Date().getTime() / 1000;
                for (let device of devices) {
                    message.gw_udi = null;
                    message.device_udi = device.udi;
                    this._dependencies.logger.debug(correlationId, "Sending signal msg to %s : %s", device.org_id, device.udi);
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
exports.SignalProcessor = SignalProcessor;
//# sourceMappingURL=SignalProcessor.js.map