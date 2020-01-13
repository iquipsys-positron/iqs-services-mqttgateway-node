"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommStatistics {
    stream(stream) {
        this.device_udi = stream.streamNullableString(this.device_udi);
        this.init_time = stream.streamNullableDateTime(this.init_time);
        this.up_time = stream.streamNullableDateTime(this.up_time);
        this.up_packets = stream.streamNullableDWord(this.up_packets);
        this.up_errors = stream.streamNullableDWord(this.up_errors);
        this.down_time = stream.streamNullableDateTime(this.down_time);
        this.down_packets = stream.streamNullableDWord(this.down_packets);
        this.down_errors = stream.streamNullableDWord(this.down_errors);
    }
}
exports.CommStatistics = CommStatistics;
//# sourceMappingURL=CommStatistics.js.map