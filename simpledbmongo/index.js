/**
 * Important: This is a simple database, it is not recommended to use it for large projects, it is recommended to use MongoDB or other databases.
 * This file is the main file of the package, do not delete it.
 * do not to change anything in this file
 *
 * More information:
 * @author Anrekus
 * @version 1.0.0
 * @license MIT
 */

/**
 * import mongoose models
 */
const AutoShare = require("../models/autoshare");

/**
 * create class db with object name
 * @example
 * const db = new db({name: "123"})
 *
 */
class db {
  /**
   * @param {object} options
   * @param {string} options.name
   */
  constructor(options) {
    if (!options.name) throw new Error("No name specified");
    this.name = options.name;
  }
  /**
   * @param {string} id
   * id of the data
   * @param {string} data
   * data to be stored
   * @returns {Promise<void>}
   * @example
   * await db.set("123", "test")
   */
  async set(id, data) {
    if (!id) throw new Error("No ID specified");
    if (!data) throw new Error("No data specified");
    const find = await this.get(id);
    if (find) {
      await this.delete(id);
      await AutoShare.create({
        _id: id,
        data: data,
        dbname: this.name,
      });
    } else {
      await AutoShare.create({
        _id: id,
        data: data,
        dbname: this.name,
      });
    }
  }
  /**
   * @param {string} id
   * id of the data
   * @returns {Promise<string>}
   * @example
   * await db.get("123")
   */
  async get(id) {
    if (!id) throw new Error("No ID specified");
    let data = await AutoShare.findOne({ _id: id });
    if (data) return data.data;
    else return null;
  }
  /**
   * @param {string} id
   * id of the data
   * @returns {Promise<void>}
   * @example
   * await db.delete("123")
   */
  async delete(id) {
    if (!id) throw new Error("No ID specified");
    let data = AutoShare.find({ dbname: this.name });
    if (data) await AutoShare.deleteOne({ _id: id });
    else return null;
  }
  /**
   * @returns {Promise<string[]>}
   * @example
   * await db.all()
   */
  async all() {
    let data = await AutoShare.find({ dbname: this.name });
    if (data) return data;
    else return null;
  }
}

module.exports = db;
