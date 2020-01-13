"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const MessageProcessor_1 = require("./MessageProcessor");
const GatewayInitMessage_1 = require("../protocol/GatewayInitMessage");
const DeviceInitMessage_1 = require("../protocol/DeviceInitMessage");
class InitProcessor extends MessageProcessor_1.MessageProcessor {
    processMessage(gateway, device, message, callback) {
        if (message instanceof GatewayInitMessage_1.GatewayInitMessage) {
            this.processGatewayInitMessage(gateway, message, callback);
        }
        else if (message instanceof DeviceInitMessage_1.DeviceInitMessage) {
            this.processDeviceInitMessage(gateway, device, message, callback);
        }
        else {
            callback(null);
        }
    }
    processGatewayInitMessage(gateway, message, callback) {
        async.series([
            (callback) => {
                this.validateGateway(message.gw_udi, gateway, callback);
            },
            (callback) => {
                this._dependencies.logger.debug(this._correlationId, "Processed gw init msg from %s : %s", gateway.org_id, gateway.udi);
                // Update gateway information
                if (gateway.model != message.gw_model || gateway.version != message.gw_version) {
                    gateway.model = message.gw_model;
                    gateway.version = message.gw_version;
                    gateway.rec_time = new Date();
                    this._dependencies.gatewaysConnector.updateGateway(gateway);
                }
                callback();
            }
        ], callback);
    }
    processDeviceInitMessage(gateway, device, message, callback) {
        async.series([
            (callback) => {
                this.validateDevice(message.device_udi, device, callback);
            },
            (callback) => {
                this._dependencies.logger.debug(this._correlationId, "Processed dev init msg from %s : %s", device.org_id, device.udi);
                // Update device information
                if (device.version != message.device_version) {
                    device.version = message.device_version;
                    this._dependencies.devicesConnector.updateDevice(device);
                }
                callback();
            }
        ], callback);
    }
}
exports.InitProcessor = InitProcessor;
//# sourceMappingURL=InitProcessor.js.map