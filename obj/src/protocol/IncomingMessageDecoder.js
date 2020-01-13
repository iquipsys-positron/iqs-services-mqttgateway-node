"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const GatewayInitMessage_1 = require("./GatewayInitMessage");
const DeviceInitMessage_1 = require("./DeviceInitMessage");
const StateUpdateMessage_1 = require("./StateUpdateMessage");
const GatewayPingMessage_1 = require("./GatewayPingMessage");
const DevicePingMessage_1 = require("./DevicePingMessage");
const StatisticsMessage_1 = require("./StatisticsMessage");
const StateUpdateMessage2_1 = require("./StateUpdateMessage2");
const iqs_libs_protocols_node_1 = require("iqs-libs-protocols-node");
class IncomingMessageDecoder {
    static decode(buffer, callback) {
        let messageType = buffer && buffer.length > 0 ? buffer.readUInt8(0) : -1;
        let message = null;
        switch (messageType) {
            case 0:
                message = new GatewayInitMessage_1.GatewayInitMessage();
                break;
            case 1:
                message = new DeviceInitMessage_1.DeviceInitMessage();
                break;
            case 3:
                message = new StateUpdateMessage_1.StateUpdateMessage();
                break;
            case 5:
                message = new GatewayPingMessage_1.GatewayPingMessage();
                break;
            case 7:
                message = new DevicePingMessage_1.DevicePingMessage();
                break;
            case 9:
                message = new StatisticsMessage_1.StatisticsMessage();
                break;
            case 11:
                message = new StateUpdateMessage2_1.StateUpdateMessage2();
                break;
        }
        if (message != null) {
            let stream = new iqs_libs_protocols_node_1.ReadStream(buffer);
            try {
                // Deserialize the message
                message.stream(stream);
            }
            catch (_a) {
                // If streaming fails then discard the message
                message = null;
            }
        }
        if (message == null) {
            callback(new pip_services_commons_node_1.BadRequestException('mqtt-gateway', 'BAD_MESSAGE', 'Received unknown or invalid message'), null);
        }
        else {
            callback(null, message);
        }
    }
}
exports.IncomingMessageDecoder = IncomingMessageDecoder;
//# sourceMappingURL=IncomingMessageDecoder.js.map