import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { MessageProcessor } from './MessageProcessor';
import { Message } from '../protocol/Message';
export declare class StatisticsProcessor extends MessageProcessor {
    processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, callback: (err: any) => void): void;
    private processStatisticsMessage;
    requestStatistics(correlationId: string, orgId: string, gatewayId: string, callback?: (err: any) => void): void;
    private sendStatisticsReqMessage;
}
