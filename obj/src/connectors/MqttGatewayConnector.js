"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services_components_node_1 = require("pip-services-components-node");
const pip_services_mqtt_node_1 = require("pip-services-mqtt-node");
class MqttGatewayConnector {
    constructor() {
        this._connectionResolver = new pip_services_mqtt_node_1.MqttConnectionResolver();
        this._logger = new pip_services_components_node_1.CompositeLogger();
        this._upTopic = '+/up';
        this._downTopic = '+/down';
    }
    configure(config) {
        this._connectionResolver.configure(config);
        this._logger.configure(config);
    }
    setReferences(references) {
        this._connectionResolver.setReferences(references);
        this._logger.setReferences(references);
    }
    isOpen() {
        return this._client != null;
    }
    open(correlationId, callback) {
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
                    if (err)
                        this._logger.error(null, err, "Failed to subscribe to topic " + this._upTopic);
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
                    }
                    catch (ex) {
                        this._logger.error(null, ex, "Failed to process the message");
                    }
                }
            });
            // Todo: Temporary hack!!
            callback(null);
        });
    }
    close(correlationId, callback) {
        if (this._client != null) {
            this._client.end(true);
            this._client = null;
            this._logger.trace(correlationId, "Disconnected from MQTT broker");
        }
        callback(null);
    }
    sendMessage(udi, buffer) {
        if (this._client) {
            let clientId = udi.replace("+", "")
                .replace("(", "").replace(")", "")
                .replace(" ", "").replace("-", "");
            let topic = this._downTopic.replace('+', clientId);
            this._client.publish(topic, buffer, { qos: 1 }, (err) => {
                if (err)
                    this._logger.error(null, err, "Failed to publish to topic " + topic);
            });
        }
    }
    listenMessages(listener) {
        this._listener = listener;
    }
}
exports.MqttGatewayConnector = MqttGatewayConnector;
//# sourceMappingURL=MqttGatewayConnector.js.map