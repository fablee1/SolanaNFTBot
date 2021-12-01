import { ParsedConfirmedTransaction } from "@solana/web3.js";
import { NFTMint } from "lib/marketplaces";
import { getTransfersFromInnerInstructions } from "lib/marketplaces/helper";

export function parseNFTMintOnTx(
  txResp: ParsedConfirmedTransaction,
  transferInstructionIndex?: number
): NFTMint | null {
  if (!txResp.meta?.logMessages) {
    return null;
  }
  const minter = txResp.transaction.message.accountKeys.find((k) => {
    return k.signer;
  });
  if (!minter) {
    return null;
  }

  const transactionExecByMintProgram = txResp.meta.logMessages.filter((msg) =>
    msg.includes(
      process.env.SUBSCRIPTION_NFT_MINT_TOKEN_SALE_PROGRAM_ID as string
    )
  ).length;

  if (!transactionExecByMintProgram) {
    return null;
  }

  const { innerInstructions } = txResp.meta;
  if (!innerInstructions) {
    return null;
  }

  // Use the last index of it's not set
  if (typeof transferInstructionIndex == "undefined") {
    transferInstructionIndex = innerInstructions.length - 1;
  }

  if (innerInstructions.length < transferInstructionIndex + 1) {
    return null;
  }
  if (!txResp?.blockTime) {
    return null;
  }

  if (!txResp.meta?.preTokenBalances) {
    return null;
  }

  const token =
    txResp.meta?.postTokenBalances && txResp.meta?.postTokenBalances[0]?.mint;
  if (!token) {
    return null;
  }

  return {
    transaction: txResp.transaction.signatures[0],
    minter: minter.pubkey.toString(),
    token,
    mintedAt: new Date(txResp.blockTime * 1000),
  };
}
