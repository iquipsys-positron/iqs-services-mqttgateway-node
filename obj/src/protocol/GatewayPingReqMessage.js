"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
class GatewayPingReqMessage extends Message_1.Message {
    constructor() {
        super(6);
    }
    stream(stream) {
        super.stream(stream);
    }
}
exports.GatewayPingReqMessage = GatewayPingReqMessage;
//# sourceMappingURL=GatewayPingReqMessage.js.map