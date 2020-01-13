"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
class StateUpdateMessage extends Message_1.Message {
    constructor() {
        super(3);
    }
    stream(stream) {
        super.stream(stream);
        this.data_version = stream.streamByte(this.data_version);
        let state = this.freezed ? 1 : 0;
        state |= this.pressed ? 2 : 0;
        state |= this.long_pressed ? 4 : 0;
        state |= this.power ? 0 : 8; // For backward compatibility
        state = stream.streamByte(state);
        this.freezed = (state & 1) != 0;
        this.pressed = (state & 2) != 0;
        this.long_pressed = (state & 4) != 0;
        this.power = (state & 8) != 1; // For backward compatibility: 8bit = 1 = power lost -> power = false
        this.lat = this.streamCoordinate(stream, this.lat);
        this.lng = this.streamCoordinate(stream, this.lng);
        this.alt = stream.streamInteger(this.alt);
        this.angle = stream.streamWord(this.angle);
        this.speed = stream.streamWord(this.speed);
        this.quality = stream.streamByte(this.quality);
        if (this.lat == 0 && this.lng == 0) {
            this.lat = this.lng = this.alt = this.angle = this.speed = this.quality = null;
        }
        this.beacons = this.streamStrings(stream, this.beacons);
    }
}
exports.StateUpdateMessage = StateUpdateMessage;
//# sourceMappingURL=StateUpdateMessage.js.map