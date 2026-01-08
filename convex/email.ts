import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { internal, api } from "./_generated/api";

export const sendEmail = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "VIBEBUFF <digest@vibebuff.dev>",
      to: args.to,
      subject: args.subject,
      html: args.html,
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, id: data?.id };
  },
});

export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "VIBEBUFF <digest@vibebuff.dev>",
      to: args.email,
      subject: "Welcome to the Weekly Tech Stack Digest!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #e5e5e5; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 8px; border: 1px solid #262626; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">VIBEBUFF</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Weekly Tech Stack Digest</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #f5f5f5; margin: 0 0 16px 0; font-size: 22px;">You're in!</h2>
              <p style="color: #a3a3a3; line-height: 1.6; margin: 0 0 24px 0;">
                Thanks for subscribing to the Weekly Tech Stack Digest. Every week, you'll receive:
              </p>
              <ul style="color: #a3a3a3; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
                <li>Curated tool comparisons and recommendations</li>
                <li>Framework updates and release highlights</li>
                <li>AI-powered stack insights</li>
                <li>Community picks and trending tools</li>
              </ul>
              <p style="color: #a3a3a3; line-height: 1.6; margin: 0 0 24px 0;">
                In the meantime, explore our tool database and build your perfect stack:
              </p>
              <a href="https://vibebuff.dev/tools" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
                Browse 500+ Tools
              </a>
            </div>
            <div style="padding: 24px 32px; border-top: 1px solid #262626; text-align: center;">
              <p style="color: #737373; font-size: 12px; margin: 0;">
                You're receiving this because you subscribed at vibebuff.dev<br>
                <a href="https://vibebuff.dev/unsubscribe" style="color: #7c3aed;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }

    return { success: true, id: data?.id };
  },
});

export const sendUserWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const displayName = args.username || "Developer";

    const { data, error } = await resend.emails.send({
      from: "VIBEBUFF <hello@vibebuff.dev>",
      to: args.email,
      subject: "Welcome to VIBEBUFF - Your Tech Stack Journey Begins!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #e5e5e5; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 8px; border: 1px solid #262626; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">VIBEBUFF</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your Tech Stack Adventure Awaits</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #f5f5f5; margin: 0 0 16px 0; font-size: 22px;">Welcome, ${displayName}!</h2>
              <p style="color: #a3a3a3; line-height: 1.6; margin: 0 0 24px 0;">
                You've just joined thousands of developers discovering the perfect tools for their projects. Here's what you can do:
              </p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #1f1f1f; border-radius: 8px; margin-bottom: 8px;">
                    <strong style="color: #7c3aed;">Explore 500+ Tools</strong>
                    <p style="color: #a3a3a3; margin: 8px 0 0 0; font-size: 14px;">Browse our curated database of frameworks, libraries, and services.</p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 16px; background-color: #1f1f1f; border-radius: 8px;">
                    <strong style="color: #7c3aed;">Build Your Deck</strong>
                    <p style="color: #a3a3a3; margin: 8px 0 0 0; font-size: 14px;">Create and share your perfect tech stack combinations.</p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 16px; background-color: #1f1f1f; border-radius: 8px;">
                    <strong style="color: #7c3aed;">Level Up</strong>
                    <p style="color: #a3a3a3; margin: 8px 0 0 0; font-size: 14px;">Complete quests, earn XP, and unlock achievements.</p>
                  </td>
                </tr>
              </table>
              <div style="text-align: center;">
                <a href="https://vibebuff.dev/tools" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Start Exploring
                </a>
              </div>
            </div>
            <div style="padding: 24px 32px; border-top: 1px solid #262626; text-align: center;">
              <p style="color: #737373; font-size: 12px; margin: 0;">
                Questions? Reply to this email or visit <a href="https://vibebuff.dev" style="color: #7c3aed;">vibebuff.dev</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send user welcome email:", error);
      throw new Error(`Failed to send user welcome email: ${error.message}`);
    }

    return { success: true, id: data?.id };
  },
});

export const sendWeeklyDigest = internalAction({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; sent: number; total?: number }> => {
    const subscribers: { email: string }[] = await ctx.runQuery(internal.newsletter.getActiveSubscribers);
    
    if (subscribers.length === 0) {
      console.log("No active subscribers to send digest to");
      return { success: true, sent: 0 };
    }

    const trendingToolsRaw = await ctx.runQuery(api.popularity.getTrendingTools, { limit: 5 });
    const recentToolsRaw = await ctx.runQuery(api.tools.getLatestTools, { limit: 5 });
    
    const trendingTools = trendingToolsRaw.filter((t): t is NonNullable<typeof t> => t !== null).map(t => ({ name: t.name, slug: t.slug, tagline: t.tagline }));
    const recentTools = recentToolsRaw.filter((t): t is NonNullable<typeof t> => t !== null).map(t => ({ name: t.name, slug: t.slug, tagline: t.tagline }));

    const toolsHtml = trendingTools.map((tool: { name: string; slug: string; tagline: string }) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #262626;">
          <a href="https://vibebuff.dev/tools/${tool.slug}" style="color: #7c3aed; text-decoration: none; font-weight: 600;">${tool.name}</a>
          <p style="color: #a3a3a3; margin: 4px 0 0 0; font-size: 13px;">${tool.tagline}</p>
        </td>
      </tr>
    `).join("");

    const recentHtml = recentTools.map((tool: { name: string; slug: string; tagline: string }) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #262626;">
          <a href="https://vibebuff.dev/tools/${tool.slug}" style="color: #7c3aed; text-decoration: none; font-weight: 600;">${tool.name}</a>
          <p style="color: #a3a3a3; margin: 4px 0 0 0; font-size: 13px;">${tool.tagline}</p>
        </td>
      </tr>
    `).join("");

    const digestHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #e5e5e5; padding: 40px 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #171717; border-radius: 8px; border: 1px solid #262626; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">VIBEBUFF</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Weekly Tech Stack Digest</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #f5f5f5; margin: 0 0 16px 0; font-size: 20px;">Trending This Week</h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${toolsHtml}
            </table>
            
            <h2 style="color: #f5f5f5; margin: 32px 0 16px 0; font-size: 20px;">Recently Added</h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${recentHtml}
            </table>
            
            <div style="margin-top: 32px; text-align: center;">
              <a href="https://vibebuff.dev/tools" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
                Explore All Tools
              </a>
            </div>
          </div>
          <div style="padding: 24px 32px; border-top: 1px solid #262626; text-align: center;">
            <p style="color: #737373; font-size: 12px; margin: 0;">
              You're receiving this because you subscribed at vibebuff.dev<br>
              <a href="https://vibebuff.dev/unsubscribe" style="color: #7c3aed;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY);
    let sentCount = 0;

    for (const subscriber of subscribers) {
      try {
        await resend.emails.send({
          from: "VIBEBUFF <digest@vibebuff.dev>",
          to: subscriber.email,
          subject: "Your Weekly Tech Stack Digest",
          html: digestHtml,
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
      }
    }

    console.log(`Weekly digest sent to ${sentCount}/${subscribers.length} subscribers`);
    return { success: true, sent: sentCount, total: subscribers.length };
  },
});
