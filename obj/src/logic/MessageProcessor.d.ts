import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';
import { ExternalDependencies } from '../deps/ExternalDependencies';
import { Message } from '../protocol/Message';
export declare abstract class MessageProcessor implements IConfigurable {
    protected _correlationId: string;
    protected _dependencies: ExternalDependencies;
    setDependencies(dependencies: ExternalDependencies): void;
    configure(config: ConfigParams): void;
    processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, callback: (err: any) => void): void;
    protected validateGateway(gatewayUdi: string, gateway: GatewayV1, callback?: (err: any) => void): any;
    protected validateDevice(deviceUdi: string, device: DeviceV1, callback?: (err: any) => void): any;
    protected sendMessage(udi: string, message: Message): void;
}
