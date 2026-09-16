import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  deploymentId: (process.env.NEXT_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA)?.slice(0, 16),
  outputFileTracingExcludes: { "/*": ["./.private/**/*", "./.backups/**/*", "./.tools/**/*", "./audit/**/*", "./deliverables/**/*"] },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pvuriolguibgwxmugyhh.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
