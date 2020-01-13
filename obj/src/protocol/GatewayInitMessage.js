"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
class GatewayInitMessage extends Message_1.Message {
    constructor() {
        super(0);
    }
    stream(stream) {
        super.stream(stream);
        this.gw_model = stream.streamString(this.gw_model);
        this.gw_version = stream.streamByte(this.gw_version);
    }
}
exports.GatewayInitMessage = GatewayInitMessage;
//# sourceMappingURL=GatewayInitMessage.js.map