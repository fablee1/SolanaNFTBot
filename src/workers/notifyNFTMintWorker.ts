import Discord, { TextChannel } from "discord.js";
import { Worker } from "./types";
import { Connection } from "@solana/web3.js";
import { fetchWeb3Transactions } from "lib/solana/connection";
import { parseNFTMintOnTx } from "lib/mint/parseNFTMint";
import { fetchNFTData } from "lib/solana/NFTData";
import notifyDiscordMint from "lib/discord/notifyDiscordMint";

export interface Project {
  mintAddress: string;
  discordChannelId: string;
}

export default function newWorker(
  discordClient: Discord.Client,
  web3Conn: Connection,
  project: Project
): Worker {
  const timestamp = Date.now();
  let notifyAfter = new Date(timestamp);
  let lastNotified = new Date(timestamp);
  return {
    async execute() {
      if (!discordClient.isReady()) {
        return;
      }

      const channel = (await discordClient.channels.fetch(
        project.discordChannelId
      )) as TextChannel;
      if (!channel) {
        console.warn("Can't see channel");
        return;
      }
      if (!channel.send) {
        console.warn("Channel must be a TextChannel");
        return;
      }

      await fetchWeb3Transactions(web3Conn, project.mintAddress, {
        limit: 30,
        async onTransaction(tx) {
          if (!tx.meta?.err) {
            return;
          }
          const nftMint = parseNFTMintOnTx(tx);
          if (!nftMint) {
            return;
          }
          // Don't notify purchases by the project's own account
          if (nftMint.minter === project.mintAddress) {
            return;
          }

          if (nftMint.mintedAt <= notifyAfter) {
            // ignore transactions before the last notify or last online time
            return false;
          }

          const nftData = await fetchNFTData(web3Conn, nftMint.token);
          if (!nftData) {
            return;
          }

          nftMint.nftData = nftData;

          await notifyDiscordMint(discordClient, channel, nftMint);

          if (nftMint.mintedAt > lastNotified) {
            lastNotified = nftMint.mintedAt;
          }
        },
      });
      notifyAfter = lastNotified;
    },
  };
}
