import { CommandValueV1 } from '../data/version1/CommandValueV1';
export interface IMqttGatewayController {
    sendCommands(correlationId: string, orgId: string, deviceId: string, values: CommandValueV1[], timestamp: number, callback?: (err: any, result: boolean) => void): any;
    broadcastCommands(correlationId: string, orgId: string, values: CommandValueV1[], timestamp: number, callback?: (err: any, result: boolean) => void): any;
    sendSignal(correlationId: string, orgId: string, deviceId: string, signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): any;
    broadcastSignal(correlationId: string, orgId: string, signal: number, timestamp: number, callback?: (err: any, result: boolean) => void): any;
    pingGateway(correlationId: string, orgId: string, gatewayId: string, callback?: (err: any) => void): any;
    pingDevice(correlationId: string, orgId: string, deviceId: string, callback?: (err: any) => void): any;
    requestStatistics(correlationId: string, orgId: string, gatewayId: string, callback?: (err: any) => void): any;
}
