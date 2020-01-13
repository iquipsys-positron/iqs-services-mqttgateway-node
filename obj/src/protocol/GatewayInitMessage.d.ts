import { IStream } from 'iqs-libs-protocols-node';
import { Message } from './Message';
export declare class GatewayInitMessage extends Message {
    gw_model: string;
    gw_version: number;
    constructor();
    stream(stream: IStream): void;
}
