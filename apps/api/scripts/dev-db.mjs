// Local-only Postgres (PGlite, WASM) on 127.0.0.1:5442 so the API runs without Docker.
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const db = await PGlite.create("./.pgdata");
const server = new PGLiteSocketServer({ db, port: 5442, host: "127.0.0.1" });
await server.start();
console.log("dev postgres (pglite) on 127.0.0.1:5442");

const stop = async () => {
  await server.stop();
  await db.close();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
