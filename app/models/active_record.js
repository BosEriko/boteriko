const admin = require('firebase-admin');
const env = require('@config/environments/base');
const schema = require('@db/schema');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    }),
    databaseURL: `https://${env.firebase.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app/`
  });
}

class ActiveRecord {
  constructor(attributes = {}) {
    const modelName = this.constructor.model_name;
    const modelSchema = schema[modelName];
    if (!modelSchema) throw new Error(`Schema not found for model: ${modelName}`);

    this.attributes = {};

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
    return this.adapter === 'firestore'
      ? admin.firestore()
      : admin.database();
  }

  static get collection_name() {
    return this.model_name;
  }

  static new(attributes = {}) {
    return new this(attributes);
  }

  static async create(attributes = {}) {
    const instance = new this(attributes);
    await instance.save();
    return instance;
  }

  static async find(id) {
    if (this.adapter === 'firestore') {
      const doc = await this.db.collection(this.collection_name).doc(id).get();
      return doc.exists ? new this({ id, ...doc.data() }) : null;
    } else {
      const snapshot = await this.db.ref(`${this.collection_name}/${id}`).get();
      return snapshot.exists() ? new this({ id, ...snapshot.val() }) : null;
    }
  }

  static async all() {
    const results = [];

    if (this.adapter === 'firestore') {
      const snapshot = await this.db.collection(this.collection_name).get();
      snapshot.forEach(doc => {
        results.push(new this({ id: doc.id, ...doc.data() }));
      });
    } else {
      const snapshot = await this.db.ref(this.collection_name).get();
      const data = snapshot.val();
      if (data) {
        for (const [id, value] of Object.entries(data)) {
          results.push(new this({ id, ...value }));
        }
      }
    }

    return results;
  }

  static async where(conditions = {}) {
    const allRecords = await this.all();
    return allRecords.filter(record =>
      Object.entries(conditions).every(([key, val]) => record.attributes[key] === val)
    );
  }

  static async first(n = 1) {
    const all = await this.all();
    const slice = all.slice(0, n);
    return n === 1 ? slice[0] || null : slice;
  }

  static async last(n = 1) {
    const all = await this.all();
    const slice = all.slice(-n);
    return n === 1 ? slice[0] || null : slice;
  }

  static async find_by(conditions = {}) {
    const matches = await this.where(conditions);
    return matches[0] || null;
  }

  static async find_or_create_by(conditions = {}) {
    const found = await this.find_by(conditions);
    if (found) return found;
    const instance = new this(conditions);
    return await instance.save();
  }

  static async find_or_initialize_by(conditions = {}) {
    const found = await this.find_by(conditions);
    if (found) return found;
    return new this(conditions);
  }

  static async find_or_create_by_id(id, attributes = {}) {
    const found = await this.find(id);
    if (found) return found;
    const instance = new this({ id, ...attributes });
    return await instance.save();
  }

  async update(attrs = {}) {
    Object.assign(this.attributes, attrs);
    this.validate_field_types(schema[this.constructor.model_name].columns);
    return await this.save();
  }

  async destroy() {
    if (!this.attributes.id) throw new Error('Cannot destroy record without ID');

    if (this.constructor.adapter === 'firestore') {
      await this.constructor.db.collection(this.constructor.collection_name).doc(this.attributes.id).delete();
    } else {
      await this.constructor.db.ref(`${this.constructor.collection_name}/${this.attributes.id}`).remove();
    }

    return true;
  }

  async save() {
    const id = this.attributes.id || this.constructor.generate_id();

    if (this.constructor.adapter === 'firestore') {
      await this.constructor.db.collection(this.constructor.collection_name).doc(id).set(this.attributes);
    } else {
      await this.constructor.db.ref(`${this.constructor.collection_name}/${id}`).set(this.attributes);
    }

    this.attributes.id = id;
    return this;
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
        throw new TypeError(
          `Invalid type for field '${key}': expected '${expected}', got '${actual}'`
        );
      }
    }
  }

  static generate_id() {
    return Math.random().toString(36).substring(2, 10);
  }
}

module.exports = ActiveRecord;
