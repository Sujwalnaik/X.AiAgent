import { config } from "dotenv";
import { TwitterApi } from "twitter-api-v2";
config();

const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET_KEY,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

export async function createPost(status) {
    console.log("🚀 Posting to Twitter:", status);
    try {
        const newPost = await twitterClient.v2.tweet(status);

        console.log("✅ Posted successfully", newPost);

        return {
            content: [
                {
                    type: "text",
                    text: `✅ Tweeted: ${status}\n🔗 https://twitter.com/user/status/${newPost.data.id}`
                }
            ]
        };
    } catch (error) {
        console.error("Twitter API Error:", error);
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Failed to post tweet: ${error.message || "Unknown error"}`
                }
            ]
        };
    }
}
