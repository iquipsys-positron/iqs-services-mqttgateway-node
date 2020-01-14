/// <reference types="node" />
import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { IMqttGatewayConnector } from './IMqttGatewayConnector';
export declare class MqttGatewayConnector implements IMqttGatewayConnector, IConfigurable, IReferenceable, IOpenable {
    private _connectionResolver;
    private _logger;
    private _client;
    private _upTopic;
    private _downTopic;
    private _listener;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    isOpen(): boolean;
    open(correlationId: string, callback: (err: any) => void): void;
    close(correlationId: string, callback: (err: any) => void): void;
    sendMessage(udi: string, buffer: Buffer): void;
    listenMessages(listener: (buffer: Buffer) => void): void;
}
