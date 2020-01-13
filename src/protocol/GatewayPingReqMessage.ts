import { IStream } from 'iqs-libs-protocols-node';
import { Message } from './Message';

export class GatewayPingReqMessage extends Message {

    public constructor() {
        super(6);
    }

    public stream(stream: IStream): void {
        super.stream(stream);
    }
    
}