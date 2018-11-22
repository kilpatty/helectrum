/*!
 * plugin.js - helectrum plugin for hsd
 * Copyright (c) 2017-2018, Christopher Jeffrey (MIT License).
 * Copyright (c) 2018, Handshake Alliance Developers (MIT License).
 * https://github.com/handshakealliance/helectrum
 */

"use strict";

const EventEmitter = require("events");
const ChainClient = require("./chainclient");
const HelectrumDB = require("./helectrumdb.js");
const HTTP = require("./http");
const { Network } = require("hsd");

/**
 * @exports wallet/plugin
 */

const plugin = exports;

/**
 * Plugin
 * @extends EventEmitter
 */

class Plugin extends EventEmitter {
  constructor(node) {
    super();

    this.config = node.config.filter("helectrum");
    this.config.open("helectrum.conf");

    this.network = node.network;
    this.logger = node.logger;

    this.client = new ChainClient(node);

    console.log("connecting to: %s", node.network);

    //Init DB here
    this.hdb = new HelectrumDB({
      network: this.network,
      logger: this.logger,
      client: this.client,
      memory: this.config.bool("memory", node.memory),
      //Not sure if this is required XXX
      prefix: this.prefix,
      maxFiles: this.config.uint("max-files"),
      cacheSize: this.config.mb("cache-size")
    });

    //Init http here
    this.http = new Http({
      network: this.network,
      logger: this.logger,
      node: this,
      ssl: this.config.bool("ssl"),
      keyFile: this.config.path("ssl-key"),
      certFile: this.config.path("ssl-cert"),
      host: this.config.str("http-host"),
      port: this.config.uint("http-port"),
      apiKey: this.config.str("api-key", node.config.str("api-key")),
      walletAuth: this.config.bool("wallet-auth"),
      noAuth: this.config.bool("no-auth"),
      cors: this.config.bool("cors"),
      adminToken: this.config.str("admin-token")
    });

    this.init();
  }

  init() {
    //Do error handling in here/emit them.
    console.log("Sup boys");
  }

  //Going to open the http server here and the database
  async open() {}

  //Close the db and the http server.
  async close() {}
}

/**
 * Plugin name.
 * @const {String}
 */

plugin.id = "helectrum";

/**
 * Plugin initialization.
 * @param {Node} node
 * @returns {Helectrum}
 */

plugin.init = function init(node) {
  return new Plugin(node);
};
