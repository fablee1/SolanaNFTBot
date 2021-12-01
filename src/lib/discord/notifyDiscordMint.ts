import Discord, { MessageEmbed, TextChannel } from "discord.js";
import { NFTMint } from "lib/marketplaces";

const status: {
  totalNotified: number;
  lastNotified?: Date;
} = {
  totalNotified: 0,
};

export function getStatus() {
  return status;
}

export default async function notifyDiscordMint(
  client: Discord.Client,
  channel: TextChannel,
  nftMint: NFTMint
) {
  if (!client.isReady()) {
    return;
  }

  const { nftData } = nftMint;
  const rarity_rank = (nftData as any)?.attributes.find(
    (a: any) => a?.trait_type === "rarity rank"
  ).value;
  const description = `Has just been minted, ranking ${rarity_rank} by rarity!`;
  const embedMsg = new MessageEmbed({
    color: "#ff0033",
    title: nftData?.name,
    description,
    url: `https://solscan.io/token/${nftMint.token}`,
    thumbnail: {
      url: nftData?.image,
    },
  });
  await channel.send({
    embeds: [embedMsg],
  });
  const logMsg = `Notified discord #${channel.name}: ${nftData?.name} - ${description}`;
  console.log(logMsg);

  status.lastNotified = new Date();
  status.totalNotified++;
}
