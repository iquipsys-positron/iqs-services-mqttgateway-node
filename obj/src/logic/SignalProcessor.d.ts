import { MessageProcessor } from './MessageProcessor';
export declare class SignalProcessor extends MessageProcessor {
    sendSignal(correlationId: string, orgId: string, deviceId: string, signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): void;
    broadcastSignal(correlationId: string, orgId: string, signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): void;
    private sendSignalMessages;
}
