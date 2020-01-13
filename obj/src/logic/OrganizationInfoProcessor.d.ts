import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { MessageProcessor } from './MessageProcessor';
import { Message } from '../protocol/Message';
export declare class OrganizationInfoProcessor extends MessageProcessor {
    private _organizationInfoTickets;
    processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, callback: (err: any) => void): void;
    private processOrganizationInfoMessage;
    private sendOrganizationInfoMessage;
}
