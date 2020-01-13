let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';

import { OrganizationInfoProcessor } from '../../src/logic/OrganizationInfoProcessor';
import { DeviceInitMessage } from '../../src/protocol/DeviceInitMessage';
import { StateUpdateMessage } from '../../src/protocol/StateUpdateMessage';

import { TestDependencies } from '../deps/TestDependencies';
import { TestGatewayConnector } from '../connectors/TestGatewayConnector';
import { GatewaysMemoryClientV1 } from 'iqs-clients-gateways-node/obj/src/version1/GatewaysMemoryClientV1';

suite('OrganizationInfoProcessor', ()=> {    
    let processor: OrganizationInfoProcessor;
    let dependencies: TestDependencies;
    let connector: TestGatewayConnector;

    let SITE1 = <OrganizationV1> {
        id: '1',
        version: 2,
        name: 'Test Organization 1',
        code: 'TESTSITE1'
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

        let organizationsClient = dependencies.organizationsClient;
        organizationsClient.createOrganization(null, SITE1, (err, organization) => {});

        let devicesClient = dependencies.devicesClient;
        devicesClient.createDevice(null, DEVICE1, (err, gw) => {});
            
        processor = new OrganizationInfoProcessor();
        processor.setDependencies(dependencies);
    });
    
    test('Send organization info for device init message', (done) => {
        let message = new DeviceInitMessage();
        message.org_id = '1';
        message.device_udi = '1';
        message.data_version = 1;

        processor.processMessage(null, DEVICE1, message, (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 1);
            assert.lengthOf(connector.outgoing[0], 29);
            
            done();
        });
    });

    test('Send organization info for state update message', (done) => {
        let message = new StateUpdateMessage();
        message.org_id = '1';
        message.device_udi = '1';
        message.data_version = 1;

        processor.processMessage(null, DEVICE1, message, (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 1);
            assert.lengthOf(connector.outgoing[0], 29);
            
            done();
        });
    });
      
});