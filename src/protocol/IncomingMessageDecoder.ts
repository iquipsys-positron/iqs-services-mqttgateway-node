import { BadRequestException } from 'pip-services3-commons-node';

import { Message } from './Message';
import { GatewayInitMessage } from './GatewayInitMessage';
import { DeviceInitMessage } from './DeviceInitMessage';
import { StateUpdateMessage } from './StateUpdateMessage';
import { GatewayPingMessage } from './GatewayPingMessage';
import { DevicePingMessage } from './DevicePingMessage';
import { StatisticsMessage } from './StatisticsMessage';
import { StateUpdateMessage2 } from './StateUpdateMessage2';
import { ReadStream } from 'iqs-libs-protocols-node';

export class IncomingMessageDecoder {

    public static decode(buffer: Buffer,
        callback: (err: any, message: Message) => void): void {
        
        let messageType = buffer && buffer.length > 0 ? buffer.readUInt8(0) : -1;
        let message: Message = null;

        switch (messageType) {
            case 0:
                message = new GatewayInitMessage();
                break;
            case 1:
                message = new DeviceInitMessage();
                break;
            case 3:
                message = new StateUpdateMessage();
                break;
            case 5:
                message = new GatewayPingMessage();
                break;
            case 7:
                message = new DevicePingMessage();
                break;
            case 9:
                message = new StatisticsMessage();
                break;
            case 11:
                message = new StateUpdateMessage2();
                break;
        }

        if (message != null) {
            let stream = new ReadStream(buffer);
            try {
                // Deserialize the message
                message.stream(stream);
            } catch {
                // If streaming fails then discard the message
                message = null;
            }
        }

        if (message == null) {
            callback(new BadRequestException(
                'mqtt-gateway',
                'BAD_MESSAGE',
                'Received unknown or invalid message'
            ), null);
        } else {
            callback(null, message);
        }
    }
    
}