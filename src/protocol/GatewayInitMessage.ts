import { IStream } from 'iqs-libs-protocols-node';
import { Message } from './Message';

export class GatewayInitMessage extends Message {
    public gw_model: string;
    public gw_version: number;

    public constructor() {
        super(0);
    }

    public stream(stream: IStream): void {
        super.stream(stream);
    
        this.gw_model = stream.streamString(this.gw_model);
        this.gw_version = stream.streamByte(this.gw_version);
    }
    
}