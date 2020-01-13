import { IStream } from 'iqs-libs-protocols-node';
import { Message } from './Message';
import { CommStatistics } from './CommStatistics';
export declare class StatisticsMessage extends Message {
    stats: CommStatistics[];
    constructor();
    stream(stream: IStream): void;
    private streamStats;
}
