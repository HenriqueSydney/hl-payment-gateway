/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "file-safe-hub", 
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1", 
        },
      },
    };
  },
  async run() {    
    const queue = new sst.aws.Queue("DonationQueue");

    queue.subscribe({
      handler: "src/functions/donation-worker.handler",
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
      },
    });

    // 3. Cria a API (Producer)
    const api = new sst.aws.ApiGatewayV2("Api");

    api.route("$default", {
      handler: "src/app.handler",
      link: [queue], 
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
        DonationQueueUrl: queue.url,
      },
    });

    return {
      ApiEndpoint: api.url,
      QueueUrl: queue.url,
    };
  },
});
