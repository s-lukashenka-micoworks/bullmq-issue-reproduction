import { FlowProducer } from "bullmq";
import { connection } from "./connection.mjs";

import { myQueue1 } from "./worker1.mjs";
import { myQueue2 } from "./worker2.mjs";

const flowProducer = new FlowProducer({ connection });

await Promise.all(
  Array.from({ length: 60 }).map(async (_, i) => {
    const childJobs = Array.from({ length: 2 }).map((item) => {
      return {
        name: "childJob",
        queueName: myQueue2.name,
        data: { foo: `boo-bar-${i}` },
        opts: {
          failParentOnFailure: true,
        },
      };
    });

    const parentJob = {
      name: "parentJob",
      queueName: myQueue1.name,
      children: childJobs,
      data: { foo: `bar-${i}` },
      opts: {
        group: {
          id: i % 2 == 0 ? "group1" : "group2",
        },
      },
    };

    return flowProducer.add(parentJob);
  })
);

process.exit(0);
