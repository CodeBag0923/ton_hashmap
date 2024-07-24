import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type HashmapConfig = {};

export function hashmapConfigToCell(config: HashmapConfig): Cell {
    return beginCell().endCell();
}

export class Hashmap implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Hashmap(address);
    }

    static createFromConfig(config: HashmapConfig, code: Cell, workchain = 0) {
        const data = hashmapConfigToCell(config);
        const init = { code, data };
        return new Hashmap(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
