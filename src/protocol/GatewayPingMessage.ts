import { IStream } from 'iqs-libs-protocols-node';
import { Message } from './Message';

export class GatewayPingMessage extends Message {

    public constructor() {
        super(5);
    }

    public stream(stream: IStream): void {
        super.stream(stream);
    }
    
}