const admin = require('firebase-admin');
const schema = require('@db/schema');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: Config.firebase.projectId,
      clientEmail: Config.firebase.clientEmail,
      privateKey: Config.firebase.privateKey,
    }),
    databaseURL: `https://${Config.firebase.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app/`
  });
}

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const CACHE_LIMIT = 100;

class ActiveRecord {
  static _cache = {};
  static _cacheOrder = [];

  constructor(attributes = {}, id = null) {
    const modelName = this.constructor.model_name;
    const modelSchema = schema[modelName];
    if (!modelSchema) throw new Error(`Schema not found for model: ${modelName}`);

    this.id = id;
    this.attributes = {};

    for (const key of Object.keys(attributes)) {
      if (!modelSchema.columns[key]) {
        throw new Error(`Unknown attribute '${key}' for model ${modelName}`);
      }
    }

    for (const [key, def] of Object.entries(modelSchema.columns)) {
      const value = attributes[key];
      if (value !== undefined) {
        this.attributes[key] = value;
      } else if (def.default !== undefined) {
        this.attributes[key] = def.default;
      }
    }

    this.validate_required_fields(modelSchema.columns);
    this.validate_field_types(modelSchema.columns);
  }

  static get model_name() {
    return this.name.toLowerCase() + 's';
  }

  static get adapter() {
    const modelSchema = schema[this.model_name];
    if (!modelSchema) throw new Error(`Missing schema for model: ${this.model_name}`);
    return modelSchema.type;
  }

  static get db() {
    return this.adapter === 'firestore' ? admin.firestore() : admin.database();
  }

  static get collection_name() {
    return this.model_name;
  }

  static cacheKey(id) {
    return `${this.collection_name}:${id}`;
  }

  static getFromCache(key) {
    const cached = this._cache[key];
    if (cached && cached.expires > Date.now()) {
      const index = this._cacheOrder.indexOf(key);
      if (index > -1) {
        this._cacheOrder.splice(index, 1);
        this._cacheOrder.push(key);
      }
      return cached.value;
    }
    delete this._cache[key];
    const index = this._cacheOrder.indexOf(key);
    if (index > -1) this._cacheOrder.splice(index, 1);
    return null;
  }

  static setCache(key, value) {
    if (!this._cache[key]) {
      this._cacheOrder.push(key);
      if (this._cacheOrder.length > CACHE_LIMIT) {
        const oldestKey = this._cacheOrder.shift();
        delete this._cache[oldestKey];
      }
    } else {
      const index = this._cacheOrder.indexOf(key);
      if (index > -1) {
        this._cacheOrder.splice(index, 1);
        this._cacheOrder.push(key);
      }
    }
    this._cache[key] = {
      value,
      expires: Date.now() + CACHE_TTL
    };
  }

  static clearCache(key) {
    delete this._cache[key];
    const index = this._cacheOrder.indexOf(key);
    if (index > -1) this._cacheOrder.splice(index, 1);
  }

  static async find(id) {
    if (!id) throw new Error('ID is required for find');
    const cacheKey = this.cacheKey(id);

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return new this(cached, id);
    }

    let data;
    if (this.adapter === 'firestore') {
      const doc = await this.db.collection(this.collection_name).doc(id).get();
      if (!doc.exists) return null;
      data = doc.data();
    } else {
      const snapshot = await this.db.ref(`${this.collection_name}/${id}`).get();
      if (!snapshot.exists()) return null;
      data = snapshot.val();
    }

    this.setCache(cacheKey, data);
    return new this(data, id);
  }

  static async all() {
    const cacheKey = `${this.collection_name}:all`;

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached.map(item => new this(item.attributes, item.id));
    }

    const results = [];
    if (this.adapter === 'firestore') {
      const snapshot = await this.db.collection(this.collection_name).get();
      snapshot.forEach(doc => {
        results.push(new this(doc.data(), doc.id));
      });
    } else {
      const snapshot = await this.db.ref(this.collection_name).get();
      const data = snapshot.val();
      if (data) {
        for (const [id, value] of Object.entries(data)) {
          results.push(new this(value, id));
        }
      }
    }

    this.setCache(cacheKey, results.map(r => ({ attributes: r.attributes, id: r.id })));
    return results;
  }

  async save() {
    if (!this.id) throw new Error('ID is required to save');

    if (this.constructor.adapter === 'firestore') {
      await this.constructor.db.collection(this.constructor.collection_name).doc(this.id).set(this.attributes);
    } else {
      await this.constructor.db.ref(`${this.constructor.collection_name}/${this.id}`).set(this.attributes);
    }

    this.constructor.setCache(this.constructor.cacheKey(this.id), this.attributes);
    delete this.constructor._cache[`${this.constructor.collection_name}:all`];

    return this;
  }

  async update(attrs = {}) {
    Object.assign(this.attributes, attrs);
    return await this.save();
  }

  async destroy() {
    if (!this.id) throw new Error('Cannot destroy record without ID');

    if (this.constructor.adapter === 'firestore') {
      await this.constructor.db.collection(this.constructor.collection_name).doc(this.id).delete();
    } else {
      await this.constructor.db.ref(`${this.constructor.collection_name}/${this.id}`).remove();
    }

    this.constructor.clearCache(this.constructor.cacheKey(this.id));
    delete this.constructor._cache[`${this.constructor.collection_name}:all`];

    return true;
  }

  validate_required_fields(columns) {
    for (const [key, def] of Object.entries(columns)) {
      if (def.required && (this.attributes[key] === undefined || this.attributes[key] === null)) {
        throw new Error(`Missing required field: ${key}`);
      }
    }
  }

  validate_field_types(columns) {
    for (const [key, def] of Object.entries(columns)) {
      const expected = def.type;
      const actual = typeof this.attributes[key];
      if (this.attributes[key] !== undefined && actual !== expected) {
        throw new TypeError(`Invalid type for field '${key}': expected '${expected}', got '${actual}'`);
      }
    }
  }
}

module.exports = ActiveRecord;
