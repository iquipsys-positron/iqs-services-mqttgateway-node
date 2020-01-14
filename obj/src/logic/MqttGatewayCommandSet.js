"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_commons_node_5 = require("pip-services3-commons-node");
const CommandValueV1Schema_1 = require("../data/version1/CommandValueV1Schema");
class MqttGatewayCommandSet extends pip_services3_commons_node_1.CommandSet {
    constructor(logic) {
        super();
        this._logic = logic;
        // Register commands
        this.addCommand(this.makeSendCommandsCommand());
        this.addCommand(this.makeBroadcastCommandsCommand());
        this.addCommand(this.makeSendSignalCommand());
        this.addCommand(this.makeBroadcastSignalCommand());
        this.addCommand(this.makePingGatewayCommand());
        this.addCommand(this.makePingDeviceCommand());
        this.addCommand(this.makeRequestStatistisCommand());
    }
    makeSendCommandsCommand() {
        return new pip_services3_commons_node_2.Command("send_commands", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_5.TypeCode.String)
            .withRequiredProperty('device_id', pip_services3_commons_node_5.TypeCode.String)
            .withRequiredProperty('commands', new pip_services3_commons_node_4.ArraySchema(new CommandValueV1Schema_1.CommandValueV1Schema()))
            .withOptionalProperty('timestamp', pip_services3_commons_node_5.TypeCode.Integer), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let deviceId = args.getAsNullableString("device_id");
            let commands = args.getAsObject("commands");
            let timestamp = args.getAsNullableInteger("timestamp");
            this._logic.sendCommands(correlationId, orgId, deviceId, commands, timestamp, (err, result) => {
                callback(err, result != null ? { result: result } : null);
            });
        });
    }
    makeBroadcastCommandsCommand() {
        return new pip_services3_commons_node_2.Command("broadcast_commands", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_5.TypeCode.String)
            .withRequiredProperty('commands', new pip_services3_commons_node_4.ArraySchema(new CommandValueV1Schema_1.CommandValueV1Schema()))
            .withOptionalProperty('timestamp', pip_services3_commons_node_5.TypeCode.Integer), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let deviceId = args.getAsNullableString("device_id");
            let commands = args.getAsObject("commands");
            let timestamp = args.getAsNullableInteger("timestamp");
            this._logic.broadcastCommands(correlationId, orgId, commands, timestamp, (err, result) => {
                callback(err, result != null ? { result: result } : null);
            });
        });
    }
    makeSendSignalCommand() {
        return new pip_services3_commons_node_2.Command("send_signal", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_5.TypeCode.String)
            .withRequiredProperty('device_id', pip_services3_commons_node_5.TypeCode.String)
            .withRequiredProperty('signal', pip_services3_commons_node_5.TypeCode.Integer)
            .withOptionalProperty('timestamp', pip_services3_commons_node_5.TypeCode.Integer), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let deviceId = args.getAsNullableString("device_id");
            let signal = args.getAsInteger("signal");
            let timestamp = args.getAsNullableInteger("timestamp");
            this._logic.sendSignal(correlationId, orgId, deviceId, signal, timestamp, (err, result) => {
                callback(err, result != null ? { result: result } : null);
            });
        });
    }
    makeBroadcastSignalCommand() {
        return new pip_services3_commons_node_2.Command("broadcast_signal", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_5.TypeCode.String)
            .withRequiredProperty('signal', pip_services3_commons_node_5.TypeCode.Integer)
            .withOptionalProperty('timestamp', pip_services3_commons_node_5.TypeCode.Integer), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let deviceId = args.getAsNullableString("device_id");
            let signal = args.getAsInteger("signal");
            let timestamp = args.getAsNullableInteger("timestamp");
            this._logic.broadcastSignal(correlationId, orgId, signal, timestamp, (err, result) => {
                callback(err, result != null ? { result: result } : null);
            });
        });
    }
    makePingGatewayCommand() {
        return new pip_services3_commons_node_2.Command("ping_gateway", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_5.TypeCode.String)
            .withRequiredProperty('gateway_id', pip_services3_commons_node_5.TypeCode.String), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let gatewayId = args.getAsNullableString("gateway_id");
            this._logic.pingGateway(correlationId, orgId, gatewayId, (err) => {
                callback(err, null);
            });
        });
    }
    makePingDeviceCommand() {
        return new pip_services3_commons_node_2.Command("ping_device", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_5.TypeCode.String)
            .withRequiredProperty('device_id', pip_services3_commons_node_5.TypeCode.String), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let deviceId = args.getAsNullableString("device_id");
            this._logic.pingDevice(correlationId, orgId, deviceId, (err) => {
                callback(err, null);
            });
        });
    }
    makeRequestStatistisCommand() {
        return new pip_services3_commons_node_2.Command("request_statistics", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_5.TypeCode.String)
            .withRequiredProperty('gateway_id', pip_services3_commons_node_5.TypeCode.String), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let gatewayId = args.getAsNullableString("gateway_id");
            this._logic.requestStatistics(correlationId, orgId, gatewayId, (err) => {
                callback(err, null);
            });
        });
    }
}
exports.MqttGatewayCommandSet = MqttGatewayCommandSet;
//# sourceMappingURL=MqttGatewayCommandSet.js.map