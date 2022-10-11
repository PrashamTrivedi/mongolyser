const Datastore = require('@seald-io/nedb');
const { app } = require('electron');
const path = require('path');
const fs = require("fs")

const DEFAULT_OPTIONS = {
  noClear: false
}

exports.LocalDBAdapter = class {

    #db_name;
    #datastore;
    #db_path;

    constructor(db_name, options = DEFAULT_OPTIONS) {
        this.#db_name = db_name;
        this.#db_path = path.join(app.getPath("appData"), this.#db_name + ".db");
        
        // remove old processes
        if (!options.noClear) {
          this._clearDatabase();
        }
        
        // create a new instance
        this.#datastore = new Datastore({
            filename: this.#db_path,
            autoload: true
        });
    }

    _clearDatabase() {
      console.log("Cleaning old instances");
      try {
        fs.unlinkSync(this.#db_path);
      } catch (error) {
        if (error.code === "ENOENT") {
          console.log("No Base DB File Found");
        } else {
          console.error(error);
        }
      }
    }

    insert(obj) {
      return new Promise((resolve, reject) => {
        this.#datastore.insert(obj, (err, result) => {
          if (err) {
              reject(err);
              return;
          }
          resolve(result)
        })
      })
   }

    fetch(query, limit = 20, skip = 0, sort = { _id: -1 }, projection = {}) {
      return new Promise((resolve, reject) => {
        this.#datastore.find(query).projection(projection).skip(limit * skip).sort(sort).limit(limit).exec((err, data) => {
          if (err) { 
            reject(err);
            return;
          }

          resolve(data)
          
        })
      })
    }

    update(query, update, options) {
      return new Promise((resolve, reject) => {
        this.#datastore.update(query, update, options, (err, num) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(num);
        })
      })
    }

    count(query) {
      return new Promise((resolve, reject) => {
        this.#datastore.count(query, (err, num) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(num);
        })
      })
    }

    updateSync(query, update, options) {
      return new Promise((resolve, reject) => {
        this.fetch(query, 1, 0).then(d => {
          if (d.length === 1) {
            this.update(query, update, options).then(data => resolve(data)).catch(e => {
              console.error(e)
              reject(e);
            })
          } else {
            this.insert({...update.$set, count: 1}).then(data => resolve(data)).catch(e => {
              console.error(e)
              reject(e);
            })
          }
        }).catch(e => {
          console.error(e);
          reject(e);
        })
      })
    }
}