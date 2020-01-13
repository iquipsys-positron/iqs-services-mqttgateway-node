let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';

import { SignalProcessor } from '../../src/logic/SignalProcessor';
import { GatewayPingMessage } from '../../src/protocol/GatewayPingMessage';
import { GatewayPingReqMessage } from '../../src/protocol/GatewayPingReqMessage';
import { DevicePingMessage } from '../../src/protocol/DevicePingMessage';
import { DevicePingReqMessage } from '../../src/protocol/DevicePingReqMessage';

import { TestDependencies } from '../deps/TestDependencies';
import { TestGatewayConnector } from '../connectors/TestGatewayConnector';
import { GatewaysMemoryClientV1 } from 'iqs-clients-gateways-node/obj/src/version1/GatewaysMemoryClientV1';

suite('SignalProcessor', ()=> {    
    let processor: SignalProcessor;
    let dependencies: TestDependencies;
    let connector: TestGatewayConnector;

    let GATEWAY1 = <GatewayV1> {
        id: '1',
        udi: '111',
        org_id: '1',
        active: true
    };        
    let DEVICE1 = <DeviceV1> {
        id: '1',
        udi: '111',
        org_id: '1',
        status: 'active'
    };
    
    setup(() => {
        connector = new TestGatewayConnector();

        dependencies = new TestDependencies();
        dependencies.connector = connector;

        let gatewayClient = dependencies.gatewaysClient;
        gatewayClient.createGateway(null, GATEWAY1, (err, gw) => {});

        let devicesClient = dependencies.devicesClient;
        devicesClient.createDevice(null, DEVICE1, (err, gw) => {});
            
        processor = new SignalProcessor();
        processor.setDependencies(dependencies);
    });
    
    test('Send device signal message', (done) => {
        processor.sendSignal(null, '1', '1', 1, null, (err, result) => {
            assert.isNull(err);

            assert.isTrue(result);

            assert.lengthOf(connector.outgoing, 2);
            assert.lengthOf(connector.outgoing[0], 17);

            done();
        });
    });

    test('Send broadcast signal message', (done) => {
        processor.broadcastSignal(null, '1', 1, null, (err, result) => {
            assert.isNull(err);

            assert.isTrue(result);

            assert.lengthOf(connector.outgoing, 2);
            assert.lengthOf(connector.outgoing[0], 17);

            done();
        });
    });
    
});