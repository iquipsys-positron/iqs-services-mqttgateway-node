import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { MessageProcessor } from './MessageProcessor';
import { Message } from '../protocol/Message';
export declare class StateProcessor2 extends MessageProcessor {
    processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, callback: (err: any) => void): void;
    private createStateUpdate;
    private calculatePowered;
    private calculateFreezed;
    private calculatePressed;
    private calculateLongPressed;
    private resolveBeacons;
    private clarifyDevice;
    private calculateBeaconsPosition;
    private processStateUpdateMessage;
}
