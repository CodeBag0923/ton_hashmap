import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, toNano } from '@ton/core';
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

        blockchain.now = 500;

        hashmap = blockchain.openContract(Hashmap.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await hashmap.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: hashmap.address,
            deploy: true,
            // success: true,
        });

        await hashmap.sendSet(deployer.getSender(), toNano('0.05'), {
            queryId: 123n,
            key: 1n,
            validUntil: 1000n,
            value: beginCell().storeUint(123, 16).endCell().asSlice(),
        })

        await hashmap.sendSet(deployer.getSender(), toNano('0.05'), {
            queryId: 123n,
            key: 2n,
            validUntil: 2000n,
            value: beginCell().storeUint(123, 16).endCell().asSlice(),
        })

        await hashmap.sendSet(deployer.getSender(), toNano('0.05'), {
            queryId: 123n,
            key: 3n,
            validUntil: 3000n,
            value: beginCell().storeUint(123, 16).endCell().asSlice(),
        })

        
    });

    it('should store and retrieve values', async ()=> {
        let [validUntil, value] = await hashmap.getByKey(deployer.getSender(), 1n);
        expect(validUntil).toEqual(1000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(123,16).endCell().asSlice()
        );
        
        [validUntil, value] = await hashmap.getByKey(deployer.getSender(), 2n);
        expect(validUntil).toEqual(2000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(123,16).endCell().asSlice()
        );
        

        [validUntil, value] = await hashmap.getByKey(deployer.getSender(), 3n);
        expect(validUntil).toEqual(3000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(123,16).endCell().asSlice()
        );
        
    });

    it('should throw on not found key', async () => {
        await expect(hashmap.getByKey(deployer.getSender() ,123n)).rejects.toThrow();
    });

    it('should clear old values', async ()=> {
        await hashmap.sendClearOldValues(deployer.getSender(), toNano('0.05'), {
            queryId:123n
        });

        let [validUntil, value] = await hashmap.getByKey(deployer.getSender(), 1n);
        expect(validUntil).toEqual(1000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(123, 16).endCell().asSlice()
        );

        blockchain.now = 1001;

        await hashmap.sendClearOldValues(deployer.getSender(), toNano('0.05'), {
            queryId: 123n
        })

        await expect(hashmap.getByKey(deployer.getSender(), 1n)).rejects.toThrow();


        [validUntil, value] = await hashmap.getByKey(deployer.getSender(), 2n);
        expect(validUntil).toEqual(2000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(123, 16).endCell().asSlice()
        );

        blockchain.now = 2001;

        await hashmap.sendClearOldValues(deployer.getSender(), toNano('0.05'), {
            queryId: 123n
        })

        await expect(hashmap.getByKey(deployer.getSender(), 2n)).rejects.toThrow();

        
        [validUntil, value] = await hashmap.getByKey(deployer.getSender(), 3n);
        expect(validUntil).toEqual(3000n);
        expect(value).toEqualSlice(
            beginCell().storeUint(123, 16).endCell().asSlice()
        );

        blockchain.now = 3001;

        await hashmap.sendClearOldValues(deployer.getSender(), toNano('0.05'), {
            queryId: 123n
        })

        await expect(hashmap.getByKey(deployer.getSender(), 3n)).rejects.toThrow();

        
    });



});
