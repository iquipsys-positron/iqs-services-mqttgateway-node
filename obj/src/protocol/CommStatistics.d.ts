import { IStreamable } from 'iqs-libs-protocols-node';
import { IStream } from 'iqs-libs-protocols-node';
export declare class CommStatistics implements IStreamable {
    device_udi?: string;
    init_time?: Date;
    up_time?: Date;
    up_packets?: number;
    up_errors?: number;
    down_time?: Date;
    down_packets?: number;
    down_errors?: number;
    stream(stream: IStream): void;
}
