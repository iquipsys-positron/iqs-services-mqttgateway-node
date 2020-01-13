"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
const CommStatistics_1 = require("./CommStatistics");
class StatisticsMessage extends Message_1.Message {
    constructor() {
        super(9);
        this.stats = [];
    }
    stream(stream) {
        super.stream(stream);
        this.stats = this.streamStats(stream, this.stats);
    }
    streamStats(stream, stats) {
        stats = stats || [];
        let count = stream.streamWord(stats.length);
        let result = [];
        for (let index = 0; index < count; index++) {
            let stat = stats[index] || new CommStatistics_1.CommStatistics();
            stat.stream(stream);
            result.push(stat);
        }
        return result;
    }
}
exports.StatisticsMessage = StatisticsMessage;
//# sourceMappingURL=StatisticsMessage.js.map