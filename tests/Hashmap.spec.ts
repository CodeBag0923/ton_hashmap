import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Hashmap } from '../wrappers/Hashmap';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Hashmap', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Hashmap');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let hashmap: SandboxContract<Hashmap>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        hashmap = blockchain.openContract(Hashmap.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await hashmap.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: hashmap.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and hashmap are ready to use
    });
});
