import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default withBotId(nextConfig);
