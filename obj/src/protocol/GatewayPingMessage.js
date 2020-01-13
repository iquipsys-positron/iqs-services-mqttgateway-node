"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
class GatewayPingMessage extends Message_1.Message {
    constructor() {
        super(5);
    }
    stream(stream) {
        super.stream(stream);
    }
}
exports.GatewayPingMessage = GatewayPingMessage;
//# sourceMappingURL=GatewayPingMessage.js.map