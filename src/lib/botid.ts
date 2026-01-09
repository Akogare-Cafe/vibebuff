import { checkBotId } from "botid/server";

export async function verifyBotId() {
  return await checkBotId();
}

export function isBotBlocked(result: Awaited<ReturnType<typeof checkBotId>>): boolean {
  return result.isBot === true;
}

export type BotIdResult = Awaited<ReturnType<typeof checkBotId>>;
