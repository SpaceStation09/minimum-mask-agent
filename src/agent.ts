import {
  BlockEvent,
  Finding,
  HandleBlock,
  FindingSeverity,
  FindingType,
  getEthersProvider,
  ethers,
} from "forta-agent";
import { parseEther } from "ethers/lib/utils";
import commonErc20 from "token-abis/erc20/common-erc20.json";
import { Contract } from "ethers";

export const MASK_ADDRESS = "0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7";
export const TARGET_ACCOUNT = "0xd57E81560615E55f4Cd1A35d5676b25EC1b27359";
export const MIN_BALANCE = parseEther("5");

const ethersProvider = getEthersProvider();

function provideHandleBlock(ethersProvider: ethers.providers.JsonRpcProvider): HandleBlock {
  return async function handleBlock(blockEvent: BlockEvent) {
    // alert if the mask balance of PresetFactory falls below the threshold
    const findings: Finding[] = [];

    const maskContract  = new Contract(MASK_ADDRESS, commonErc20, ethersProvider);
    const presetFacBalance = await maskContract.balanceOf(TARGET_ACCOUNT) as ethers.BigNumber;
    if(presetFacBalance.gte(MIN_BALANCE)) return findings;

    findings.push(
      Finding.fromObject({
        name: "Minimum Account Balance",
        description: `Account balance (${presetFacBalance.toString()}) below threshold (${MIN_BALANCE.toString()})`,
        alertId: "FORTA-6",
        severity: FindingSeverity.Low,
        type: FindingType.Suspicious,
        metadata: {
          balance: presetFacBalance.toString(),
        },
      })
    );

    return findings;
  }
}

export default {
  provideHandleBlock,
  handleBlock: provideHandleBlock(ethersProvider)
};
