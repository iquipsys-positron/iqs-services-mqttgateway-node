import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { MessageProcessor } from './MessageProcessor';
import { Message } from '../protocol/Message';
export declare class PingProcessor extends MessageProcessor {
    processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, callback: (err: any) => void): void;
    private processGatewayPingMessage;
    private processDevicePingMessage;
    pingGateway(correlationId: string, orgId: string, gatewayId: string, callback?: (err: any) => void): void;
    sendGatewayPingMessage(gateway: GatewayV1, timestamp: number): void;
    pingDevice(correlationId: string, orgId: string, deviceId: string, callback?: (err: any) => void): void;
    private sendDevicePingMessage;
}
