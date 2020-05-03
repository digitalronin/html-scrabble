var fs = require('fs');
var dirty = require('dirty');
var util = require('util');
var icebox = require('./icebox.js');
var EventEmitter = require('events').EventEmitter;

const redis = require('redis');
const client = redis.createClient(); // TODO: use REDIS_URL here
const { promisify } = require("util");
const getAsync = promisify(client.get).bind(client);

// //////////////////////////////////////////////////////////////////////

function DB(path) {
    this.prototypeMap = {};
    EventEmitter.call(this);
    console.log('opening database', path);
    this.path = path;
    this.dirty = dirty(path);
    var db = this;
    this.dirty.on('load', function () { db.emit('load', 0); });
}

util.inherits(DB, EventEmitter);

DB.prototype.registerObject = function(constructor) {
    this.prototypeMap[constructor.name] = constructor;
}

DB.prototype.get = function(key) {
    return icebox.thaw(this.dirty.get(key), this.prototypeMap);
}

DB.prototype.asyncGet = async function(key) {
    const json = await getAsync(key);
    const data = JSON.parse(json);
    const game = icebox.thaw(data, this.prototypeMap);
    return game;
}

DB.prototype.set = function(key, object) {
    data = icebox.freeze(object);
    this.dirty.set(key, data);
    client.set(key, JSON.stringify(data));
}

DB.prototype.all = function() {
    var retval = [];
    this.dirty.forEach(function(key, value) {
        retval.push(value);
    });
    return retval;
}

DB.prototype.snapshot = function() {
    var db = this;
    var filename = this.path + '.tmp';
    if (fs.existsSync(filename)) {
        throw 'snapshot cannot overwrite existing file ' + filename;
    }
    var snapshot = dirty(filename);
    snapshot.on('load', function() {
        db.dirty.forEach(function(key, value) {
            snapshot.set(key, value);
        });
    });
    snapshot.on('drain', function() {
        fs.renameSync(db.path, db.path + '.old');
        fs.renameSync(filename, db.path);
        db.dirty = dirty(db.path);
        console.log('DB snapshot finished');
    });
}

exports.DB = DB;
