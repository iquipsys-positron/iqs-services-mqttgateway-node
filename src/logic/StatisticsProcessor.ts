let _ = require('lodash');
let async = require('async');

import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';

import { MessageProcessor } from './MessageProcessor';
import { Message } from '../protocol/Message';
import { StatisticsReqMessage } from '../protocol/StatisticsReqMessage';
import { StatisticsMessage } from '../protocol/StatisticsMessage';

export class StatisticsProcessor extends MessageProcessor {

    public processMessage(gateway: GatewayV1, device: DeviceV1, message: Message, 
        callback: (err: any) => void): void {
        if (message instanceof StatisticsMessage) {
            this.processStatisticsMessage(gateway, <StatisticsMessage>message, callback);
        } else {
            callback(null);
        }
    }

    private processStatisticsMessage(gateway: GatewayV1, message: StatisticsMessage,
        callback: (err: any) => void): void {
        async.series([
            (callback) => {
                this.validateGateway(message.gw_udi, gateway, callback);
            }, 
            (callback) => {
                this._dependencies.logger.debug(
                    this._correlationId, "Processed stats msg from %s : %s", gateway.org_id, gateway.udi
                );
                
                gateway.stats_time = message.time;
                gateway.stats = message.stats;
                this._dependencies.gatewaysConnector.updateGateway(gateway);
        
                callback();
            }
        ], callback);
    }

    public requestStatistics(correlationId: string, orgId: string, gatewayId: string,
        callback?: (err: any) => void): void {

        let gateway: GatewayV1;

        async.series([
            // Find all gateways for specified organization
            (callback) => {
                this._dependencies.gatewaysConnector.findGatewayById(gatewayId, (err, data) => {
                    gateway = data;
                    callback(err);
                });
            },
            // Send messages to all devices throught all organizations
            (callback) => {
                let timestamp = new Date().getTime() / 1000;

                if (gateway != null)
                    this.sendStatisticsReqMessage(gateway, timestamp);

                callback();
            }
        ], callback);
    }

    private sendStatisticsReqMessage(gateway: GatewayV1, timestamp: number): void {
        let message = new StatisticsReqMessage();
        message.org_id = gateway.org_id;
        message.gw_udi = gateway.udi;

        this._dependencies.logger.debug(
            this._correlationId, "Sending gw stat req to %s : %s", gateway.org_id, gateway.udi
        );

        this.sendMessage(gateway.udi, message);
    }
    
}