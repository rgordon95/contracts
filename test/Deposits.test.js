const { expectRevert, ether } = require('openzeppelin-test-helpers');
const { deployAllProxies } = require('../deployments');
const {
  getNetworkConfig,
  deployLogicContracts
} = require('../deployments/common');
const { deployVRC } = require('../deployments/vrc');
const { removeNetworkFile } = require('./utils');

const Deposits = artifacts.require('Deposits');
const Operators = artifacts.require('Operators');

contract('Deposits', ([_, admin, operator, anyone]) => {
  let networkConfig;
  let deposits;
  let users = [admin, operator, anyone];

  beforeEach(async () => {
    networkConfig = await getNetworkConfig();
    await deployLogicContracts({ networkConfig });
    let vrc = await deployVRC(admin);
    let {
      deposits: depositsProxy,
      operators: operatorsProxy
    } = await deployAllProxies({
      initialAdmin: admin,
      networkConfig,
      vrc: vrc.address
    });
    deposits = await Deposits.at(depositsProxy);
    let operators = await Operators.at(operatorsProxy);
    await operators.addOperator(operator, { from: admin });
  });

  after(() => {
    removeNetworkFile(networkConfig.network);
  });

  it('only collectors can increase deposit amounts', async () => {
    for (let i = 0; i < users.length; i++) {
      await expectRevert(
        deposits.increaseAmount(
          web3.utils.soliditySha3('randomUserId'),
          ether('3'),
          {
            from: users[i]
          }
        ),
        'Permission denied.'
      );
    }
  });

  it('only collectors can decrease deposit amounts', async () => {
    for (let i = 0; i < users.length; i++) {
      await expectRevert(
        deposits.decreaseAmount(
          web3.utils.soliditySha3('randomUserId'),
          ether('3'),
          {
            from: users[i]
          }
        ),
        'Permission denied.'
      );
    }
  });
});