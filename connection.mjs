import Redis from "ioredis";

export const connection = new Redis({
  port: 6378,
  host: "localhost",
  username: "",
  password: "",
  db: 0,
  //required as per https://github.com/nocodb/nocodb/issues/2452
  maxRetriesPerRequest: null,
  tls: undefined,
});
