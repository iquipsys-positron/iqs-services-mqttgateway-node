let _ = require('lodash');

import { ConfigParams } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { Descriptor } from 'pip-services-commons-node';
import { IReferenceable } from 'pip-services-commons-node';
import { IOpenable } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-components-node';
import { MqttConnectionResolver } from 'pip-services-mqtt-node';

import { IMqttGatewayConnector } from './IMqttGatewayConnector';

export class MqttGatewayConnector 
    implements IMqttGatewayConnector, IConfigurable, IReferenceable, IOpenable {
    
    private _connectionResolver: MqttConnectionResolver = new MqttConnectionResolver();
    private _logger: CompositeLogger = new CompositeLogger();
    private _client: any;
    private _upTopic: string = '+/up';
    private _downTopic: string = '+/down';
    private _listener: any;

    public configure(config: ConfigParams): void {
        this._connectionResolver.configure(config);
        this._logger.configure(config);
    }

    public setReferences(references: IReferences): void {
        this._connectionResolver.setReferences(references);
        this._logger.setReferences(references);
    }

    public isOpen(): boolean {
        return this._client != null;
    }

    public open(correlationId: string, callback: (err: any) => void): void {
        this._connectionResolver.resolve(correlationId, (err, options) => {
            if (err) {
                callback(err);
                return;
            }

            let mqtt = require('mqtt');
            let client = mqtt.connect(options.uri, options);
            
            client.on('connect', () => {
                this._client = client;

                this._logger.trace(correlationId, "Connected to MQTT broker");

                // Subscribe to the topic
                this._client.subscribe(this._upTopic, (err) => {
                    if (err) this._logger.error(null, err, "Failed to subscribe to topic " + this._upTopic);
                });

                // callback(null);
            });
            
            client.on('error', (err) => {
                this._logger.error(correlationId, err, "Failed to connect to " + options.uri);
                // callback(err);
            });

            client.on('message', (topic, buffer, packet) => {
                if (this._listener) {
                    try {
                        this._listener(buffer);
                    } catch (ex) {
                        this._logger.error(null, ex, "Failed to process the message");
                    }
                }
            });
            
            // Todo: Temporary hack!!
            callback(null);
        });
    }

    public close(correlationId: string, callback: (err: any) => void): void {
        if (this._client != null) {
            this._client.end(true);
            this._client = null;
            this._logger.trace(correlationId, "Disconnected from MQTT broker");
        }

        callback(null);
    }

    public sendMessage(udi: string, buffer: Buffer): void {
        if (this._client) {
            let clientId = udi.replace("+", "")
                .replace("(", "").replace(")", "")
                .replace(" ", "").replace("-", "");

            let topic = this._downTopic.replace('+', clientId);
            this._client.publish(topic, buffer, { qos: 1 }, (err) => {
                if (err) this._logger.error(null, err, "Failed to publish to topic " + topic);
            });
        }
    }
 
    public listenMessages(listener: (buffer: Buffer) => void) {
        this._listener = listener;
    }
}