import { ConvexHttpClient } from "convex/browser";

const PROD_URL = "https://neat-dinosaur-364.convex.cloud";

async function testProfileUpdate() {
  const client = new ConvexHttpClient(PROD_URL);

  console.log("Testing updateProfile mutation on production...");
  
  try {
    // This will fail without auth, but we can see what error we get
    const result = await client.mutation("userSettings:updateProfile" as any, {
      displayName: "Test User",
      bio: "Test bio",
      location: "Test Location",
      website: "https://test.com",
      githubUsername: "testuser",
      twitterUsername: "testuser",
    });
    
    console.log("Success:", result);
  } catch (error: any) {
    console.error("Error:", error.message);
    console.error("Full error:", JSON.stringify(error, null, 2));
  }
}

testProfileUpdate();
