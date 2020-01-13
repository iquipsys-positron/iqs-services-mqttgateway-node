"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const MessageProcessor_1 = require("./MessageProcessor");
const StatisticsReqMessage_1 = require("../protocol/StatisticsReqMessage");
const StatisticsMessage_1 = require("../protocol/StatisticsMessage");
class StatisticsProcessor extends MessageProcessor_1.MessageProcessor {
    processMessage(gateway, device, message, callback) {
        if (message instanceof StatisticsMessage_1.StatisticsMessage) {
            this.processStatisticsMessage(gateway, message, callback);
        }
        else {
            callback(null);
        }
    }
    processStatisticsMessage(gateway, message, callback) {
        async.series([
            (callback) => {
                this.validateGateway(message.gw_udi, gateway, callback);
            },
            (callback) => {
                this._dependencies.logger.debug(this._correlationId, "Processed stats msg from %s : %s", gateway.org_id, gateway.udi);
                gateway.stats_time = message.time;
                gateway.stats = message.stats;
                this._dependencies.gatewaysConnector.updateGateway(gateway);
                callback();
            }
        ], callback);
    }
    requestStatistics(correlationId, orgId, gatewayId, callback) {
        let gateway;
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
    sendStatisticsReqMessage(gateway, timestamp) {
        let message = new StatisticsReqMessage_1.StatisticsReqMessage();
        message.org_id = gateway.org_id;
        message.gw_udi = gateway.udi;
        this._dependencies.logger.debug(this._correlationId, "Sending gw stat req to %s : %s", gateway.org_id, gateway.udi);
        this.sendMessage(gateway.udi, message);
    }
}
exports.StatisticsProcessor = StatisticsProcessor;
//# sourceMappingURL=StatisticsProcessor.js.map