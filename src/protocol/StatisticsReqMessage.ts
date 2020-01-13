import { IStream } from 'iqs-libs-protocols-node';
import { Message } from './Message';

export class StatisticsReqMessage extends Message {

    public constructor() {
        super(10);
    }

    public stream(stream: IStream): void {
        super.stream(stream);
    }
    
}