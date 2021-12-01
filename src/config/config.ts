export interface Subscription {
  discordChannelId: string;
  type: "NFTSale" | "NFTMint";
  mintAddress: string;
}
export interface Config {
  subscriptions: Subscription[];
}

export interface MutableConfig extends Config {
  setSubscriptions(subscriptions: Subscription[]): Promise<void>;
  addSubscription(subscription: Subscription): Promise<void>;
}

const config: Config = {
  subscriptions: [],
};

export default config;

export function loadConfig(): MutableConfig {
  /**
   * Load config from permanent storage
   */

  if (
    process.env.SUBSCRIPTION_MINT_ADDRESS &&
    process.env.SUBSCRIPTION_DISCORD_CHANNEL_ID
  ) {
    config.subscriptions.push({
      type: "NFTSale",
      discordChannelId: process.env.SUBSCRIPTION_DISCORD_CHANNEL_ID,
      mintAddress: process.env.SUBSCRIPTION_MINT_ADDRESS,
    });
  }

  if (
    process.env.SUBSCRIPTION_DISCORD_MINT_CHANNEL_ID &&
    process.env.SUBSCRIPTION_NFT_MINT_ADDRESS &&
    process.env.SUBSCRIPTION_NFT_MINT_TOKEN_SALE_PROGRAM_ID
  ) {
    config.subscriptions.push({
      type: "NFTMint",
      discordChannelId: process.env.SUBSCRIPTION_DISCORD_MINT_CHANNEL_ID,
      mintAddress: process.env.SUBSCRIPTION_NFT_MINT_ADDRESS,
    });
  }
  return {
    ...config,
    async setSubscriptions(subscriptions: Subscription[]): Promise<void> {
      this.subscriptions = subscriptions;
    },
    async addSubscription(subscription: Subscription): Promise<void> {
      this.subscriptions.push(subscription);
    },
  };
}
