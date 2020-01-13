"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const MessageProcessor_1 = require("./MessageProcessor");
const GatewayPingReqMessage_1 = require("../protocol/GatewayPingReqMessage");
const GatewayPingMessage_1 = require("../protocol/GatewayPingMessage");
const DevicePingReqMessage_1 = require("../protocol/DevicePingReqMessage");
const DevicePingMessage_1 = require("../protocol/DevicePingMessage");
class PingProcessor extends MessageProcessor_1.MessageProcessor {
    processMessage(gateway, device, message, callback) {
        if (message instanceof GatewayPingMessage_1.GatewayPingMessage) {
            this.processGatewayPingMessage(gateway, message, callback);
        }
        else if (message instanceof DevicePingMessage_1.DevicePingMessage) {
            this.processDevicePingMessage(gateway, device, message, callback);
        }
        else {
            callback(null);
        }
    }
    processGatewayPingMessage(gateway, message, callback) {
        async.series([
            (callback) => {
                this.validateGateway(message.gw_udi, gateway, callback);
            },
            (callback) => {
                this._dependencies.logger.debug(this._correlationId, "Processed gw ping msg from %s : %s", gateway.org_id, gateway.udi);
                gateway.ping_time = message.time;
                this._dependencies.gatewaysConnector.updateGateway(gateway);
                callback();
            }
        ], callback);
    }
    processDevicePingMessage(gateway, device, message, callback) {
        async.series([
            (callback) => {
                this.validateDevice(message.device_udi, device, callback);
            },
            (callback) => {
                this._dependencies.logger.debug(this._correlationId, "Processed dev ping msg from %s : %s", device.org_id, device.udi);
                device.ping_time = message.time;
                this._dependencies.devicesConnector.updateDevice(device);
                callback();
            }
        ], callback);
    }
    pingGateway(correlationId, orgId, gatewayId, callback) {
        let gateway;
        async.series([
            // Find all gateways for specified organization
            (callback) => {
                this._dependencies.gatewaysConnector.findGatewayById(gatewayId, (err, data) => {
                    gateway = data;
                    callback(err);
                });
            },
            // Send messages to all devices throught all organizations
            (callback) => {
                let timestamp = new Date().getTime() / 1000;
                if (gateway != null)
                    this.sendGatewayPingMessage(gateway, timestamp);
                callback();
            }
        ], callback);
    }
    sendGatewayPingMessage(gateway, timestamp) {
        let message = new GatewayPingReqMessage_1.GatewayPingReqMessage();
        message.org_id = gateway.org_id;
        message.gw_udi = gateway.udi;
        this._dependencies.logger.debug(this._correlationId, "Sending gw ping msg to %s : %s", gateway.org_id, gateway.udi);
        this.sendMessage(gateway.udi, message);
    }
    pingDevice(correlationId, orgId, deviceId, callback) {
        let device;
        let gateways;
        async.series([
            // Get device reference
            (callback) => {
                this._dependencies.devicesConnector.findDeviceById(deviceId, (err, data) => {
                    // Validate device
                    if (data != null)
                        err = this.validateDevice(deviceId, data);
                    device = data;
                    callback(err);
                });
            },
            // Find all gateways for specified organization
            (callback) => {
                this._dependencies.gatewaysConnector.findGatewaysByorgId(orgId, (err, data) => {
                    gateways = data;
                    callback(err);
                });
            },
            // Send messages to all devices throught all organizations
            (callback) => {
                let timestamp = new Date().getTime() / 1000;
                this.sendDevicePingMessage(gateways, device, timestamp);
                callback();
            }
        ], callback);
    }
    sendDevicePingMessage(gateways, device, timestamp) {
        let message = new DevicePingReqMessage_1.DevicePingReqMessage();
        message.org_id = device.org_id;
        message.device_udi = device.udi;
        message.timestamp = timestamp || new Date().getTime() / 1000;
        this._dependencies.logger.debug(this._correlationId, "Sending device ping msg to %s : %s", device.org_id, device.udi);
        // Send message directly to device
        this.sendMessage(device.udi, message);
        // Send through gateways
        for (let gateway of gateways) {
            message.gw_udi = gateway.udi;
            this.sendMessage(gateway.udi, message);
        }
    }
}
exports.PingProcessor = PingProcessor;
//# sourceMappingURL=PingProcessor.js.map