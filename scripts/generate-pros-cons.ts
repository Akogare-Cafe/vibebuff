import Anthropic from "@anthropic-ai/sdk";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface Tool {
  _id: Id<"tools">;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  features?: string[];
  tags?: string[];
  pricingModel: string;
  isOpenSource: boolean;
  pros?: string[];
  cons?: string[];
}

async function generateProsAndCons(tool: Tool): Promise<{ pros: string[]; cons: string[] }> {
  const prompt = `Generate 3-5 strengths (pros) and 2-4 weaknesses (cons) for this developer tool:

Name: ${tool.name}
Tagline: ${tool.tagline}
Description: ${tool.description}
Features: ${tool.features?.join(", ") || "N/A"}
Tags: ${tool.tags?.join(", ") || "N/A"}
Pricing: ${tool.pricingModel}
Open Source: ${tool.isOpenSource}

Requirements:
- Pros should be concise, specific benefits (e.g., "Fast cold starts", "Great DX", "Active community")
- Cons should be honest limitations (e.g., "Steep learning curve", "Limited free tier", "Vendor lock-in")
- Each point should be 2-6 words maximum
- Be realistic and balanced
- Focus on developer experience, performance, cost, and ecosystem

Respond ONLY with valid JSON in this exact format:
{
  "pros": ["benefit 1", "benefit 2", "benefit 3"],
  "cons": ["limitation 1", "limitation 2"]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      pros: result.pros || [],
      cons: result.cons || [],
    };
  } catch (error) {
    console.error(`Error generating for ${tool.name}:`, error);
    return {
      pros: ["Useful for developers"],
      cons: ["Limited information available"],
    };
  }
}

async function main() {
  console.log("Fetching tools missing pros/cons...");
  
  const checkResult = await client.query(api.checkToolsProsConsInternal.checkToolsProsAndCons);
  
  const toolsToUpdate = checkResult.missingOrEmptyPros;
  console.log(`Found ${toolsToUpdate.length} tools to update`);

  const batchSize = 10;
  const delayBetweenBatches = 2000;
  
  for (let i = 0; i < toolsToUpdate.length; i += batchSize) {
    const batch = toolsToUpdate.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(toolsToUpdate.length / batchSize)}`);
    
    const updates = await Promise.all(
      batch.map(async (toolInfo) => {
        const tool = await client.query(api.tools.getBySlug, { slug: toolInfo.slug });
        if (!tool) {
          console.log(`  ⚠️  Tool not found: ${toolInfo.name}`);
          return null;
        }

        console.log(`  Generating for: ${tool.name}`);
        const { pros, cons } = await generateProsAndCons(tool as Tool);
        
        return {
          toolId: tool._id,
          pros,
          cons,
        };
      })
    );

    const validUpdates = updates.filter((u) => u !== null);
    
    if (validUpdates.length > 0) {
      try {
        const result = await client.mutation(api.bulkUpdateProsConsInternal.bulkUpdateToolProsCons, {
          updates: validUpdates,
        });
        console.log(`  ✅ Updated ${result.updated}/${result.total} tools`);
        if (result.errors.length > 0) {
          console.log(`  ⚠️  Errors:`, result.errors);
        }
      } catch (error) {
        console.error(`  ❌ Batch update failed:`, error);
      }
    }

    if (i + batchSize < toolsToUpdate.length) {
      console.log(`  Waiting ${delayBetweenBatches}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  console.log("\n✅ All tools processed!");
  
  const finalCheck = await client.query(api.checkToolsProsConsInternal.checkToolsProsAndCons);
  console.log(`\nFinal stats:`);
  console.log(`  Total tools: ${finalCheck.totalTools}`);
  console.log(`  Missing pros: ${finalCheck.missingOrEmptyPros.length}`);
  console.log(`  Missing cons: ${finalCheck.missingOrEmptyCons.length}`);
}

main().catch(console.error);
