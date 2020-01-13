"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services_components_node_1 = require("pip-services-components-node");
const pip_services_components_node_2 = require("pip-services-components-node");
const pip_services_commons_node_1 = require("pip-services-commons-node");
const iqs_clients_devices_node_1 = require("iqs-clients-devices-node");
const MqttGatewayCommandSet_1 = require("./MqttGatewayCommandSet");
const ExternalDependenciesResolver_1 = require("../deps/ExternalDependenciesResolver");
const IncomingMessageDecoder_1 = require("../protocol/IncomingMessageDecoder");
const InitProcessor_1 = require("./InitProcessor");
const OrganizationInfoProcessor_1 = require("./OrganizationInfoProcessor");
const StateProcessor_1 = require("./StateProcessor");
const StateProcessor2_1 = require("./StateProcessor2");
const CommandProcessor_1 = require("./CommandProcessor");
const SignalProcessor_1 = require("./SignalProcessor");
const PingProcessor_1 = require("./PingProcessor");
const StatisticsProcessor_1 = require("./StatisticsProcessor");
class MqttGatewayController {
    constructor() {
        this._logger = new pip_services_components_node_1.CompositeLogger();
        this._counters = new pip_services_components_node_2.CompositeCounters();
        this._dependencyResolver = new ExternalDependenciesResolver_1.ExternalDependenciesResolver();
        this._initProcessor = new InitProcessor_1.InitProcessor();
        this._organizationInfoProcessor = new OrganizationInfoProcessor_1.OrganizationInfoProcessor();
        this._stateProcessor = new StateProcessor_1.StateProcessor();
        this._stateProcessor2 = new StateProcessor2_1.StateProcessor2();
        this._commandProcessor = new CommandProcessor_1.CommandProcessor();
        this._signalProcessor = new SignalProcessor_1.SignalProcessor();
        this._pingProcessor = new PingProcessor_1.PingProcessor();
        this._statisticsProcessor = new StatisticsProcessor_1.StatisticsProcessor();
    }
    configure(config) {
        this._logger.configure(config);
        this._dependencyResolver.configure(config);
        this._initProcessor.configure(config);
        this._organizationInfoProcessor.configure(config);
        this._stateProcessor.configure(config);
        this._stateProcessor2.configure(config);
        this._commandProcessor.configure(config);
        this._signalProcessor.configure(config);
        this._pingProcessor.configure(config);
        this._statisticsProcessor.configure(config);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._dependencyResolver.setReferences(references);
        this._dependencies = this._dependencyResolver.resolve();
        this._dependencies.logger = this._logger;
        this._dependencies.counters = this._counters;
        this._dependencies.connector.listenMessages((buffer) => {
            this.onMessage(buffer);
        });
        this._initProcessor.setDependencies(this._dependencies);
        this._organizationInfoProcessor.setDependencies(this._dependencies);
        this._stateProcessor.setDependencies(this._dependencies);
        this._stateProcessor2.setDependencies(this._dependencies);
        this._commandProcessor.setDependencies(this._dependencies);
        this._signalProcessor.setDependencies(this._dependencies);
        this._pingProcessor.setDependencies(this._dependencies);
        this._statisticsProcessor.setDependencies(this._dependencies);
    }
    getCommandSet() {
        if (this._commandSet == null)
            this._commandSet = new MqttGatewayCommandSet_1.MqttGatewayCommandSet(this);
        return this._commandSet;
    }
    lookupGateway(message, callback) {
        // If gateway is not set then skip
        if (message.gw_udi == '') {
            callback(null, null);
            return;
        }
        let gatewayUdi = message.gw_udi;
        this._dependencies.gatewaysConnector.resolveGateway(gatewayUdi, (err, gateway) => {
            // Clarify organization id by gateway
            if (gateway != null && message.org_id == '')
                message.org_id = gateway.org_id;
            // Match gateway and organization
            if (gateway != null && message.org_id != '' && message.org_id != gateway.org_id) {
                err = new pip_services_commons_node_1.BadRequestException('mqtt-gateway', 'SITE_MISMATCH', 'Gateway and organization are mismatched').withDetails('org_id', message.org_id);
            }
            callback(err, gateway);
        });
    }
    lookupDevice(message, callback) {
        if (message.device_udi != '' && message.org_id == '') {
            this._dependencies.devicesConnector.resolveDeviceWithoutorgId(message.device_udi, (err, device) => {
                callback(err, device);
            });
            return;
        }
        else if (message.device_udi == '' || message.org_id == '') {
            callback(null, null);
            return;
        }
        let orgId = message.org_id;
        let deviceUdi = message.device_udi;
        this._dependencies.devicesConnector.resolveDevice(orgId, deviceUdi, (err, device) => {
            // Match device and organization
            if (device != null && message.org_id != '' && message.org_id != device.org_id) {
                err = new pip_services_commons_node_1.BadRequestException('mqtt-gateway', 'SITE_MISMATCH', 'Device and organization are mismatched').withDetails('org_id', message.org_id);
            }
            callback(err, device);
        });
    }
    onMessage(buffer) {
        let gateway;
        let device;
        let message;
        async.series([
            (callback) => {
                IncomingMessageDecoder_1.IncomingMessageDecoder.decode(buffer, (err, data) => {
                    message = data;
                    callback(err);
                });
            },
            (callback) => {
                this.lookupGateway(message, (err, data) => {
                    gateway = data;
                    callback(err);
                });
            },
            (callback) => {
                this.lookupDevice(message, (err, data) => {
                    device = data;
                    // Skip inactive devices
                    if (device && device.status != iqs_clients_devices_node_1.DeviceStatusV1.Active)
                        err = 'abort';
                    callback(err);
                });
            },
            (callback) => {
                async.parallel([
                    (callback) => {
                        this._initProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._stateProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._stateProcessor2.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._organizationInfoProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._commandProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._signalProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._pingProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._statisticsProcessor.processMessage(gateway, device, message, callback);
                    }
                ], callback);
            }
        ], (err) => {
            if (err == 'abort')
                err = null;
            if (err)
                this._logger.error("mqtt-gateway", err, "Failed to process the message");
        });
    }
    sendCommands(correlationId, orgId, deviceId, values, timestamp, callback) {
        this._commandProcessor.sendCommands(correlationId, orgId, deviceId, values, timestamp, callback);
    }
    broadcastCommands(correlationId, orgId, values, timestamp, callback) {
        this._commandProcessor.broadcastCommands(correlationId, orgId, values, timestamp, callback);
    }
    sendSignal(correlationId, orgId, deviceId, signal, timestamp, callback) {
        //  old signalProcessing
        // this._signalProcessor.sendSignal(correlationId, orgId, deviceId, signal, timestamp, callback);
        // CommandMessage is supported
        let values = [{ id: 1, val: signal }];
        this._commandProcessor.sendCommands(correlationId, orgId, deviceId, values, timestamp, callback);
    }
    broadcastSignal(correlationId, orgId, signal, timestamp, callback) {
        //  old signalProcessing
        // this._signalProcessor.broadcastSignal(correlationId, orgId, signal, timestamp, callback);
        // CommandMessage is supported
        let values = [{ id: 1, val: signal }];
        this._commandProcessor.broadcastCommands(correlationId, orgId, values, timestamp, callback);
    }
    pingGateway(correlationId, orgId, gatewayId, callback) {
        this._pingProcessor.pingGateway(correlationId, orgId, gatewayId, callback);
    }
    pingDevice(correlationId, orgId, deviceId, callback) {
        this._pingProcessor.pingDevice(correlationId, orgId, deviceId, callback);
    }
    requestStatistics(correlationId, orgId, gatewayId, callback) {
        this._statisticsProcessor.requestStatistics(correlationId, orgId, gatewayId, callback);
    }
}
exports.MqttGatewayController = MqttGatewayController;
//# sourceMappingURL=MqttGatewayController.js.map