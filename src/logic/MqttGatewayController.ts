let _ = require('lodash');
let async = require('async');

import { ConfigParams, Command } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { ICommandable } from 'pip-services-commons-node';
import { CommandSet } from 'pip-services-commons-node';
import { IReferenceable } from 'pip-services-commons-node';
import { DependencyResolver } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-components-node';
import { CompositeCounters } from 'pip-services-components-node';
import { BadRequestException } from 'pip-services-commons-node';

import { DeviceV1 } from 'iqs-clients-devices-node';
import { DeviceTypeV1 } from 'iqs-clients-devices-node';
import { DeviceStatusV1 } from 'iqs-clients-devices-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { StateUpdateV1 } from 'iqs-clients-stateupdates-node';
import { OrganizationV1 } from 'pip-clients-organizations-node';

import { IMqttGatewayConnector } from '../connectors/IMqttGatewayConnector';
import { MqttGatewayCommandSet } from './MqttGatewayCommandSet';

import { ExternalDependencies } from '../deps/ExternalDependencies';
import { ExternalDependenciesResolver } from '../deps/ExternalDependenciesResolver';

import { IncomingMessageDecoder } from '../protocol/IncomingMessageDecoder';
import { Message } from '../protocol/Message';

import { InitProcessor } from './InitProcessor';
import { OrganizationInfoProcessor } from './OrganizationInfoProcessor';
import { StateProcessor } from './StateProcessor';
import { StateProcessor2 } from './StateProcessor2';
import { CommandProcessor } from './CommandProcessor';
import { SignalProcessor } from './SignalProcessor';
import { PingProcessor } from './PingProcessor';
import { StatisticsProcessor } from './StatisticsProcessor';
import { CommandValueV1 } from '../data/version1';

export class MqttGatewayController implements IConfigurable, IReferenceable, ICommandable {
    private _logger: CompositeLogger = new CompositeLogger();
    private _counters: CompositeCounters = new CompositeCounters();
    private _dependencyResolver = new ExternalDependenciesResolver();
    private _dependencies: ExternalDependencies;
    private _commandSet: MqttGatewayCommandSet;

    private _initProcessor: InitProcessor = new InitProcessor();
    private _organizationInfoProcessor: OrganizationInfoProcessor = new OrganizationInfoProcessor();
    private _stateProcessor: StateProcessor = new StateProcessor();
    private _stateProcessor2: StateProcessor2 = new StateProcessor2();
    private _commandProcessor: CommandProcessor = new CommandProcessor();
    private _signalProcessor: SignalProcessor = new SignalProcessor();
    private _pingProcessor: PingProcessor = new PingProcessor();
    private _statisticsProcessor: StatisticsProcessor = new StatisticsProcessor();

    public configure(config: ConfigParams): void {
        this._logger.configure(config);
        this._dependencyResolver.configure(config);

        this._initProcessor.configure(config);
        this._organizationInfoProcessor.configure(config);
        this._stateProcessor.configure(config);
        this._stateProcessor2.configure(config);
        this._commandProcessor.configure(config);
        this._signalProcessor.configure(config);
        this._pingProcessor.configure(config);
        this._statisticsProcessor.configure(config);
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._counters.setReferences(references);

        this._dependencyResolver.setReferences(references);
        this._dependencies = this._dependencyResolver.resolve();
        this._dependencies.logger = this._logger;
        this._dependencies.counters = this._counters;
        this._dependencies.connector.listenMessages((buffer) => {
            this.onMessage(buffer);
        });

        this._initProcessor.setDependencies(this._dependencies);
        this._organizationInfoProcessor.setDependencies(this._dependencies);
        this._stateProcessor.setDependencies(this._dependencies);
        this._stateProcessor2.setDependencies(this._dependencies);
        this._commandProcessor.setDependencies(this._dependencies);
        this._signalProcessor.setDependencies(this._dependencies);
        this._pingProcessor.setDependencies(this._dependencies);
        this._statisticsProcessor.setDependencies(this._dependencies);
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null)
            this._commandSet = new MqttGatewayCommandSet(this);
        return this._commandSet;
    }

    private lookupGateway(message: Message, callback: (err: any, gateway: GatewayV1) => void): void {
        // If gateway is not set then skip
        if (message.gw_udi == '') {
            callback(null, null);
            return;
        }

        let gatewayUdi = message.gw_udi;
        this._dependencies.gatewaysConnector.resolveGateway(gatewayUdi, (err, gateway) => {
            // Clarify organization id by gateway
            if (gateway != null && message.org_id == '')
                message.org_id = gateway.org_id;

            // Match gateway and organization
            if (gateway != null && message.org_id != '' && message.org_id != gateway.org_id) {
                err = new BadRequestException(
                    'mqtt-gateway',
                    'SITE_MISMATCH',
                    'Gateway and organization are mismatched'
                ).withDetails('org_id', message.org_id);
            }

            callback(err, gateway);
        });
    }

    private lookupDevice(message: Message, callback: (err: any, device: DeviceV1) => void): void {
        if (message.device_udi != '' && message.org_id == '') {
            this._dependencies.devicesConnector.resolveDeviceWithoutorgId(message.device_udi, (err, device) => {
                callback(err, device);
            });
            return;
        } else if (message.device_udi == '' || message.org_id == '') {
            callback(null, null);
            return;
        }

        let orgId = message.org_id;
        let deviceUdi = message.device_udi;
        this._dependencies.devicesConnector.resolveDevice(orgId, deviceUdi, (err, device) => {
            // Match device and organization
            if (device != null && message.org_id != '' && message.org_id != device.org_id) {
                err = new BadRequestException(
                    'mqtt-gateway',
                    'SITE_MISMATCH',
                    'Device and organization are mismatched'
                ).withDetails('org_id', message.org_id);
            }

            callback(err, device);
        });
    }

    private onMessage(buffer: Buffer): void {
        let gateway: GatewayV1;
        let device: DeviceV1;
        let message: Message;

        async.series([
            (callback) => {
                IncomingMessageDecoder.decode(buffer, (err, data) => {
                    message = data;
                    callback(err);
                });
            },
            (callback) => {
                this.lookupGateway(message, (err, data) => {
                    gateway = data;
                    callback(err);
                })
            },
            (callback) => {
                this.lookupDevice(message, (err, data) => {
                    device = data;

                    // Skip inactive devices
                    if (device && device.status != DeviceStatusV1.Active)
                        err = 'abort';

                    callback(err);
                });
            },
            (callback) => {
                async.parallel([
                    (callback) => {
                        this._initProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._stateProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._stateProcessor2.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._organizationInfoProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._commandProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._signalProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._pingProcessor.processMessage(gateway, device, message, callback);
                    },
                    (callback) => {
                        this._statisticsProcessor.processMessage(gateway, device, message, callback);
                    }
                ], callback);
            }
        ], (err) => {
            if (err == 'abort') err = null;
            if (err) this._logger.error("mqtt-gateway", err, "Failed to process the message");
        });
    }

    public sendCommands(correlationId: string, orgId: string, deviceId: string,
        values: CommandValueV1[], timestamp: number, callback?: (err: any, result: boolean) => void): void {
        this._commandProcessor.sendCommands(correlationId, orgId, deviceId, values, timestamp, callback);
    }

    public broadcastCommands(correlationId: string, orgId: string,
        values: CommandValueV1[], timestamp: number, callback?: (err: any, result: boolean) => void): void {
        this._commandProcessor.broadcastCommands(correlationId, orgId, values, timestamp, callback);
    }

    public sendSignal(correlationId: string, orgId: string, deviceId: string,
        signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): void {
        //  old signalProcessing
        // this._signalProcessor.sendSignal(correlationId, orgId, deviceId, signal, timestamp, callback);

        // CommandMessage is supported
        let values = [{ id: 1, val: signal }];
        this._commandProcessor.sendCommands(correlationId, orgId, deviceId, values, timestamp, callback);
    }

    public broadcastSignal(correlationId: string, orgId: string,
        signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): void {
        //  old signalProcessing
        // this._signalProcessor.broadcastSignal(correlationId, orgId, signal, timestamp, callback);

        // CommandMessage is supported
        let values = [{ id: 1, val: signal }];
        this._commandProcessor.broadcastCommands(correlationId, orgId, values, timestamp, callback);
    }

    public pingGateway(correlationId: string, orgId: string, gatewayId: string,
        callback?: (err: any) => void): void {
        this._pingProcessor.pingGateway(correlationId, orgId, gatewayId, callback);
    }

    public pingDevice(correlationId: string, orgId: string, deviceId: string,
        callback?: (err: any) => void): void {
        this._pingProcessor.pingDevice(correlationId, orgId, deviceId, callback);
    }

    public requestStatistics(correlationId: string, orgId: string, gatewayId: string,
        callback?: (err: any) => void): void {
        this._statisticsProcessor.requestStatistics(correlationId, orgId, gatewayId, callback);
    }

}
