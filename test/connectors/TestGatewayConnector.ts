import { IMqttGatewayConnector } from '../../src/connectors/IMqttGatewayConnector';

export class TestGatewayConnector implements IMqttGatewayConnector {
    public outgoing: Buffer[] = [];

    public sendMessage(udi: string, buffer: Buffer): void {
        this.outgoing.push(buffer);
    }

    public listenMessages(listener: (buffer: Buffer) => void) {
        // Do nothing
    }
}