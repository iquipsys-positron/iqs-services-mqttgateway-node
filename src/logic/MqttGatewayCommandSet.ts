import { CommandSet } from 'pip-services3-commons-node';
import { ICommand } from 'pip-services3-commons-node';
import { Command } from 'pip-services3-commons-node';
import { Schema } from 'pip-services3-commons-node';
import { Parameters } from 'pip-services3-commons-node';
import { ObjectSchema } from 'pip-services3-commons-node';
import { ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

import { CommandValueV1Schema } from '../data/version1/CommandValueV1Schema';
import { IMqttGatewayController } from './IMqttGatewayController';

export class MqttGatewayCommandSet extends CommandSet {
    private _logic: IMqttGatewayController;

    constructor(logic: IMqttGatewayController) {
        super();

        this._logic = logic;

        // Register commands
		this.addCommand(this.makeSendCommandsCommand());
		this.addCommand(this.makeBroadcastCommandsCommand());
		this.addCommand(this.makeSendSignalCommand());
		this.addCommand(this.makeBroadcastSignalCommand());
		this.addCommand(this.makePingGatewayCommand());
		this.addCommand(this.makePingDeviceCommand());
		this.addCommand(this.makeRequestStatistisCommand());
    }

	private makeSendCommandsCommand(): ICommand {
		return new Command(
			"send_commands",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('device_id', TypeCode.String)
				.withRequiredProperty('commands', new ArraySchema(new CommandValueV1Schema()))
				.withOptionalProperty('timestamp', TypeCode.Integer),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let deviceId = args.getAsNullableString("device_id");
                let commands = args.getAsObject("commands");
                let timestamp = args.getAsNullableInteger("timestamp");
                this._logic.sendCommands(correlationId, orgId, deviceId, commands, timestamp, (err, result) => {
					callback(err, result != null ? { result: result } : null);
				});
            }
		);
	}

	private makeBroadcastCommandsCommand(): ICommand {
		return new Command(
			"broadcast_commands",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('commands', new ArraySchema(new CommandValueV1Schema()))
				.withOptionalProperty('timestamp', TypeCode.Integer),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let deviceId = args.getAsNullableString("device_id");
                let commands = args.getAsObject("commands");
                let timestamp = args.getAsNullableInteger("timestamp");
                this._logic.broadcastCommands(correlationId, orgId, commands, timestamp, (err, result) => {
					callback(err, result != null ? { result: result } : null);
				});
            }
		);
	}

	private makeSendSignalCommand(): ICommand {
		return new Command(
			"send_signal",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('device_id', TypeCode.String)
				.withRequiredProperty('signal', TypeCode.Integer)
				.withOptionalProperty('timestamp', TypeCode.Integer),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let deviceId = args.getAsNullableString("device_id");
                let signal = args.getAsInteger("signal");
                let timestamp = args.getAsNullableInteger("timestamp");
                this._logic.sendSignal(correlationId, orgId, deviceId, signal, timestamp, (err, result) => {
					callback(err, result != null ? { result: result } : null);
				});
            }
		);
	}

	private makeBroadcastSignalCommand(): ICommand {
		return new Command(
			"broadcast_signal",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('signal', TypeCode.Integer)
				.withOptionalProperty('timestamp', TypeCode.Integer),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let deviceId = args.getAsNullableString("device_id");
                let signal = args.getAsInteger("signal");
                let timestamp = args.getAsNullableInteger("timestamp");
                this._logic.broadcastSignal(correlationId, orgId, signal, timestamp, (err, result) => {
					callback(err, result != null ? { result: result } : null);
				});
            }
		);
	}

	private makePingGatewayCommand(): ICommand {
		return new Command(
			"ping_gateway",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('gateway_id', TypeCode.String),
			(correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let gatewayId = args.getAsNullableString("gateway_id");
                this._logic.pingGateway(correlationId, orgId, gatewayId, (err) => {
					callback(err, null);
				});
            }
		);
	}

	private makePingDeviceCommand(): ICommand {
		return new Command(
			"ping_device",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('device_id', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let deviceId = args.getAsNullableString("device_id");
                this._logic.pingDevice(correlationId, orgId, deviceId, (err) => {
					callback(err, null);
				});
            }
		);
	}

	private makeRequestStatistisCommand(): ICommand {
		return new Command(
			"request_statistics",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('gateway_id', TypeCode.String),
			(correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let gatewayId = args.getAsNullableString("gateway_id");
                this._logic.requestStatistics(correlationId, orgId, gatewayId, (err) => {
					callback(err, null);
				});
            }
		);
	}
	
}