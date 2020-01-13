import { IStream } from 'iqs-libs-protocols-node';
import { Message } from './Message';
import { CommStatistics } from './CommStatistics';

export class StatisticsMessage extends Message {
    public stats: CommStatistics[] = [];

    public constructor() {
        super(9);
    }

    public stream(stream: IStream): void {
        super.stream(stream);

        this.stats = this.streamStats(stream, this.stats);
    }

    private streamStats(stream: IStream, stats: CommStatistics[]): CommStatistics[] {
        stats = stats || [];
        let count = stream.streamWord(stats.length);
        let result = [];
        for (let index = 0; index < count; index++) {
            let stat: CommStatistics = stats[index] || new CommStatistics();
            stat.stream(stream);
            result.push(stat);
        }
        return result;
    }
    
}