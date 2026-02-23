import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function check() {
  const settings = await client.query("appSettings:getSettings");
  console.log(JSON.stringify(settings, null, 2));
}

check();
