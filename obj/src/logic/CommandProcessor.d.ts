import { CommandValueV1 } from '../data/version1/CommandValueV1';
import { MessageProcessor } from './MessageProcessor';
export declare class CommandProcessor extends MessageProcessor {
    sendCommands(correlationId: string, orgId: string, deviceId: string, values: CommandValueV1[], timestamp: number, callback?: (err: any, result: boolean) => void): void;
    broadcastCommands(correlationId: string, orgId: string, values: CommandValueV1[], timestamp: number, callback?: (err: any, result: boolean) => void): void;
    private sendCommandMessages;
}
