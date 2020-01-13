let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { GatewayV1 } from 'iqs-clients-gateways-node';
import { DeviceV1 } from 'iqs-clients-devices-node';

import { StatisticsProcessor } from '../../src/logic/StatisticsProcessor';
import { StatisticsMessage } from '../../src/protocol/StatisticsMessage';
import { StatisticsReqMessage } from '../../src/protocol/StatisticsReqMessage';

import { TestDependencies } from '../deps/TestDependencies';
import { TestGatewayConnector } from '../connectors/TestGatewayConnector';
import { GatewaysMemoryClientV1 } from 'iqs-clients-gateways-node/obj/src/version1/GatewaysMemoryClientV1';
import { CommStatistics } from '../../src/protocol/CommStatistics';

suite('StatisticsProcessor', ()=> {
    let processor: StatisticsProcessor;
    let dependencies: TestDependencies;
    let connector: TestGatewayConnector;

    let GATEWAY1 = <GatewayV1> {
        id: '1',
        udi: '111',
        org_id: '1',
        active: true
    };        
    
    setup(() => {
        connector = new TestGatewayConnector();

        dependencies = new TestDependencies();
        dependencies.connector = connector;

        let gatewayClient = dependencies.gatewaysClient;
        gatewayClient.createGateway(null, GATEWAY1, (err, gw) => {});
            
        processor = new StatisticsProcessor();
        processor.setDependencies(dependencies);
    });
    
    test('Receive statistics message', (done) => {
        let stat = new CommStatistics();
        stat.device_udi = '1';
        stat.init_time = new Date(2017,0,1,0,0,0);
        stat.up_time = new Date(2017,0,1,1,0,0);
        stat.up_packets = 100;
        stat.up_errors = 1;

        let message = new StatisticsMessage();
        message.org_id = '1';
        message.gw_udi = '111';
        message.stats = [ stat ];

        processor.processMessage(GATEWAY1, null, message, (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 0);

            done();
        });
    });

    test('Send statistics req message', (done) => {
        processor.requestStatistics(null, '1', '1', (err) => {
            assert.isNull(err);

            assert.lengthOf(connector.outgoing, 1);
            assert.lengthOf(connector.outgoing[0], 12);

            done();
        });
    });
      
});