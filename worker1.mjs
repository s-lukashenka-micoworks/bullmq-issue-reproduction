import { QueuePro, WorkerPro } from "@taskforcesh/bullmq-pro";

import { connection } from "./connection.mjs";

import { createRequire } from "node:module";
import { dirname } from "node:path";
import { argv } from "node:process";
import { fileURLToPath } from "node:url";

export const __filename = (meta) => fileURLToPath(meta.url);

export const __dirname = (meta) => dirname(__filename(meta));

/**
 * Indicates that the script was run directly.
 * This is an ESM replacement for `require.main === module`.
 *
 * Use it like this: `isMain(import.meta)`.
 */
export const isMain = (meta) => {
  if (!meta || !argv[1]) return false;
  const require = createRequire(meta.url);
  const scriptPath = require.resolve(argv[1]);
  const modulePath = __filename(meta);

  return scriptPath === modulePath;
};

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: {
    age: 30 * 24 * 3600, // keep up to 30 days
  },
  removeOnFail: {
    age: 30 * 24 * 3600, // keep up to 30 days
  },
};

export const myQueue1 = new QueuePro("myQueue1", {
  connection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

const workerOpts = {
  connection,
  group: {
    limit: {
      max: 1,
      duration: 3000,
    },
  },
  concurrency: 100,
};

function main() {
  console.log("Starting worker...");

  const worker = new WorkerPro(
    myQueue1.name,
    async (job) => {
      console.log(
        `Processing job ${job.id} with data ${JSON.stringify(
          job.data
        )} and opts: ${JSON.stringify(job.opts)})`
      );

      return job.data;
    },
    workerOpts
  );

  worker.on("completed", (job, returnvalue) => {
    // console.log(
    //   `Job ${job.id} completed with result: ${JSON.stringify(returnvalue)}`
    // );
  });

  worker.on("failed", async (job, err) => {
    if (!job) {
      return log.error(`Worker failed with error: ${err.message}`);
    }

    console.error(
      `Job: ${err.constructor.name} with ID ${job.id} has failed with error: ${err.stack}`
    );
  });

  worker.on("error", (err) => {
    console.error(`Worker failed with error: ${err.message}`);
  });
}

if (isMain(import.meta)) {
  await main();
}
