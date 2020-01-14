"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const iqs_clients_devices_node_1 = require("iqs-clients-devices-node");
const iqs_libs_protocols_node_1 = require("iqs-libs-protocols-node");
class MessageProcessor {
    constructor() {
        this._correlationId = 'mqtt-gateway';
    }
    setDependencies(dependencies) {
        this._dependencies = dependencies;
    }
    configure(config) {
    }
    processMessage(gateway, device, message, callback) {
        callback(null);
    }
    validateGateway(gatewayUdi, gateway, callback) {
        let err = null;
        if (gateway == null) {
            err = new pip_services3_commons_node_1.NotFoundException(this._correlationId, 'GATEWAY_NOT_FOUND', 'Gateway ' + gatewayUdi + ' was not found')
                .withDetails('gateway_udi', gatewayUdi);
        }
        if (gateway && !gateway.active) {
            err = new pip_services3_commons_node_2.InvalidStateException(this._correlationId, 'GATEWAY_INACTIVE', 'Gateway ' + gateway.id + ' is not active')
                .withDetails('gateway_id', gateway.id);
        }
        if (callback)
            callback(err);
        return err;
    }
    validateDevice(deviceUdi, device, callback) {
        let err = null;
        if (device == null) {
            err = new pip_services3_commons_node_1.NotFoundException(this._correlationId, 'DEVICE_NOT_FOUND', 'Device ' + deviceUdi + ' was not found')
                .withDetails('device_udi', deviceUdi);
        }
        if (device && device.status != iqs_clients_devices_node_1.DeviceStatusV1.Active) {
            err = new pip_services3_commons_node_2.InvalidStateException(this._correlationId, 'DEVICE_INACTIVE', 'Device ' + device.id + ' is not active')
                .withDetails('device_id', device.id);
        }
        if (callback)
            callback(err);
        return err;
    }
    sendMessage(udi, message) {
        let stream = new iqs_libs_protocols_node_1.WriteStream();
        message.stream(stream);
        let buffer = stream.toBuffer();
        this._dependencies.connector.sendMessage(udi, buffer);
    }
}
exports.MessageProcessor = MessageProcessor;
//# sourceMappingURL=MessageProcessor.js.map