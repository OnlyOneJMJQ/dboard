#!/usr/bin/env node

async function run(options = {}) {
  const { DashboardServer } = require("@truffle/dashboard");
  const address = require("address");

  const config = detectConfigOrDefault(options);

  const port = options.port || config.dashboard.port;
  const host = options.host || config.dashboard.host;
  const verbose = options.verbose || config.dashboard.verbose;
  const rpc = true;

  const dashboardServerOptions = { port, host, verbose, rpc };
  const dashboardServer = new DashboardServer(dashboardServerOptions);
  await dashboardServer.start();

  if (host === "0.0.0.0") {
    // Regex taken from react-scripts to check that the address is a private IP, otherwise we discard it
    // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
    let lanAddress =
      /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(address.ip())
        ? address.ip()
        : undefined;

    console.log(`Truffle Dashboard running at http://localhost:${port}`);
    lanAddress &&
      console.log(`                             http://${lanAddress}:${port}`);

    console.log(
      `DashboardProvider RPC endpoint running at http://localhost:${port}/rpc`
    );
    lanAddress &&
      console.log(
        `                                          http://${lanAddress}:${port}/rpc`
      );
  } else {
    console.log(`Truffle Dashboard running at http://${host}:${port}`);
    console.log(
      `DashboardProvider RPC endpoint running at http://${host}:${port}/rpc`
    );
  }

  // ensure that `await`-ing this method never resolves. (we want to keep
  // the console open until it exits on its own)
  return new Promise(() => {});
}

/*
 * UTILS
 */

const detectConfigOrDefault = (options) => {
  const Config = require("@truffle/config");

  try {
    return Config.detect(options);
  } catch (error) {
    // Suppress error when truffle can't find a config
    if (error.message === "Could not find suitable configuration file.") {
      return Config.default();
    } else {
      throw error;
    }
  }
};

run().then(() => {
  console.log("Done!");
});
