/*!
 *index.js - Helectrum Server for hsd
 * Copyright (c) 2017-2018, Christopher Jeffrey (MIT License).
 * Copyright (c) 2018, Handshake Alliance Developers (MIT License).
 * https://github.com/handshakealliance/helectrum
 */

"use strict";

const EventEmitter = require("events");
const { Network } = require("hsd");
const Logger = require("blgr");

/**
 * HelectrumDB
 * @alias module:helectrum.HelectrumDB
 * @extends EventEmitter
 */

class HelectrumDB extends EventEmitter {
  /**
   * Create an helectrum db.
   * @constructor
   * @param {Object} options
   */

  constructor(options) {
    super();

    this.options = new HelectrumOptions(options);

    this.network = this.options.network;
    this.logger = this.options.logger.context("helectrum");
    this.client = this.options.client || new NullClient(this);
    this.db = bdb.create(this.options);

    this.tip = new BlockMeta();
    this.lock = new Lock();

    this.init();
  }

  /**
   * Initialize helectrumdb.
   * @private
   */

  init() {
    this._bind();
  }

  /**
   * Bind to node events.
   * @private
   */

  /**
   * Bind to node events.
   * @private
   */

  _bind() {
    /**
     * Bind to node events.
     * @private
     */

    this.client.on("error", err => {
      this.emit("error", err);
    });

    this.client.on("connect", async () => {
      try {
        await this.syncNode();
      } catch (e) {
        this.emit("error", e);
      }
    });

    this.client.bind("block connect", async (entry, block, view) => {
      try {
        await this.indexBlock(entry, block, view);
      } catch (e) {
        this.emit("error", e);
      }
    });

    this.client.bind("block disconnect", async (entry, block, view) => {
      try {
        await this.unindexBlock(entry, block, view);
      } catch (e) {
        this.emit("error", e);
      }
    });

    this.client.bind("chain reset", async tip => {
      try {
        await this.rollback(tip.height);
      } catch (e) {
        this.emit("error", e);
      }
    });
  }

  /**
   * Index a transaction by txid.
   * @private
   * @param (ChainEntry) entry
   * @param (Block) block
   * @param (CoinView) view
   */

  async indexTX(entry, block, view) {
    if (!this.options.indexTX) return null;

    const b = this.db.batch();

    for (let i = 0; i < block.txs.length; i++) {
      const tx = block.txs[i];
      const hash = tx.hash();
      const meta = TXMeta.fromTX(tx, entry, i);
      b.put(layout.t.build(hash), meta.toRaw());
    }

    await b.write();
  }
}

class HelectrumOptions {
  /**
   * Create helectrum options.
   * @constructor
   * @param {Object} options
   */

  constructor(options) {
    this.network = Network.primary;
    this.logger = Logger.global;
    this.chain = null;
    this.client = null;
    this.prefix = null;
    this.location = null;
    this.memory = true;
    this.maxFiles = 64;
    this.cacheSize = 16 << 20;
    this.compression = true;

    if (options) this._fromOptions(options);
  }

  /**
   * Inject properties from object.
   * @private
   * @param {Object} options
   * @returns {HelectrumDBOptions}
   */

  _fromOptions(options) {
    console.log(options.network);
    console.log(typeof options.network);
    console.log(options.network.toString());
    if (options.network != null) this.network = Network.get(options.network);

    if (options.logger != null) {
      assert(typeof options.logger === "object");
      this.logger = options.logger;
    }

    if (options.client != null) {
      assert(typeof options.client === "object");
      this.client = options.client;
    }

    if (options.chain != null) {
      assert(typeof options.chain === "object");
      this.client = new ChainClient(options.chain);
    }

    assert(this.client);

    if (options.prefix != null) {
      assert(typeof options.prefix === "string");
      this.prefix = options.prefix;
      this.location = path.join(this.prefix, "helectrum");
    }

    if (options.location != null) {
      assert(typeof options.location === "string");
      this.location = options.location;
    }

    if (options.memory != null) {
      assert(typeof options.memory === "boolean");
      this.memory = options.memory;
    }

    if (options.maxFiles != null) {
      assert(options.maxFiles >>> 0 === options.maxFiles);
      this.maxFiles = options.maxFiles;
    }

    if (options.cacheSize != null) {
      assert(Number.isSafeInteger(options.cacheSize) && options.cacheSize >= 0);
      this.cacheSize = options.cacheSize;
    }

    if (options.compression != null) {
      assert(typeof options.compression === "boolean");
      this.compression = options.compression;
    }

    return this;
  }

  /**
   * Instantiate chain options from object.
   * @param {Object} options
   * @returns {WalletOptions}
   */

  static fromOptions(options) {
    return new this()._fromOptions(options);
  }
}

module.exports = HelectrumDB;
