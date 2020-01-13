/// <reference types="node" />
import { Message } from './Message';
export declare class IncomingMessageDecoder {
    static decode(buffer: Buffer, callback: (err: any, message: Message) => void): void;
}
