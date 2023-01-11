import {
  BlockEvent,
  Finding,
  HandleBlock,
  FindingSeverity,
  FindingType,
  getEthersProvider,
  ethers,
} from "forta-agent";
import { createERC20Instance } from "erc20-instance";
import { TOKEN_ADDRESS, MIN_BALANCE, target } from "./constants";

const ethersProvider = getEthersProvider();

function provideHandleBlock(
  ethersProvider: ethers.providers.JsonRpcProvider
): HandleBlock {
  return async function handleBlock(blockEvent: BlockEvent) {
    // report finding if specified account balance falls below threshold
    const findings: Finding[] = [];

    const maskToken = createERC20Instance(TOKEN_ADDRESS, ethersProvider);
    let accountBalance = await maskToken.balanceOf(target);
    if (accountBalance.gte(MIN_BALANCE)) return findings;

    const tokenName = await maskToken.name();
    const decimal = await maskToken.decimals();
    const thresholdWithDecimal = MIN_BALANCE.div(10 ** decimal);
    if(accountBalance) accountBalance = accountBalance.div(10 ** decimal);

    findings.push(
      Finding.fromObject({
        name: "Minimum Account Balance",
        description: `Account balance of \$${tokenName} falls below threshold (${thresholdWithDecimal}). Current balance: ${accountBalance.toString()}`,
        alertId: "FORTA-6",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          balance: accountBalance.toString(),
        },
      })
    );

    return findings;
  };
}

export default {
  provideHandleBlock,
  handleBlock: provideHandleBlock(ethersProvider),
};