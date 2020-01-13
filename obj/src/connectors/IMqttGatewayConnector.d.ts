/// <reference types="node" />
export interface IMqttGatewayConnector {
    sendMessage(udi: string, buffer: Buffer): void;
    listenMessages(listener: (buffer: Buffer) => void): any;
}
