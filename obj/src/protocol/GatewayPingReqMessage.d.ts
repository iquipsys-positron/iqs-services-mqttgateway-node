import { IStream } from 'iqs-libs-protocols-node';
import { Message } from './Message';
export declare class GatewayPingReqMessage extends Message {
    constructor();
    stream(stream: IStream): void;
}
