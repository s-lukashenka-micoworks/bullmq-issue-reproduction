# bullmq-issue-reproduction

## How to run

1. Start the redis instance:
```sh
docker-compose up
```

2. Start worker1

```sh
node worker1.mjs
```

3. Start worker2

```sh
node worker2.mjs
```

4. Insert the jobs

```sh
node index.mjs
```
