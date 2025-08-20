import { Queue } from "bullmq";

const base = {
  connection: {
    url: process.env.REDIS_URL!, // ex: redis://default:pass@host:port
  },
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 1000,
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  },
};

export const devotionalQueue = new Queue("devotional_import", base);
export const quoteQueue      = new Queue("quote_import", base);
export const verseQueue      = new Queue("verse_import", base);