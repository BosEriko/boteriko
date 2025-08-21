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

class ActiveRecord {
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

  static new(attributes = {}, id = null) {
    return new this(attributes, id);
  }

  static async create(attributes = {}, id) {
    if (!id) throw new Error('ID is required for create');
    const instance = new this(attributes, id);
    await instance.save();
    return instance;
  }

  static async find(id) {
    if (!id) throw new Error('ID is required for find');

    if (this.adapter === 'firestore') {
      const doc = await this.db.collection(this.collection_name).doc(id).get();
      return doc.exists ? new this(doc.data(), id) : null;
    } else {
      const snapshot = await this.db.ref(`${this.collection_name}/${id}`).get();
      return snapshot.exists() ? new this(snapshot.val(), id) : null;
    }
  }

  static async all() {
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

    return results;
  }

  static async where(conditions = {}) {
    if (this.adapter === 'firestore') {
      let query = this.db.collection(this.collection_name);

      for (const [key, value] of Object.entries(conditions)) {
        query = query.where(key, '==', value);
      }

      const snapshot = await query.get();
      const results = [];
      snapshot.forEach(doc => results.push(new this(doc.data(), doc.id)));
      return results;
    }

    if (this.adapter === 'realtime') {
      const keys = Object.keys(conditions);

      if (keys.length === 1) {
        const key = keys[0];
        const value = conditions[key];
        const snapshot = await this.db
          .ref(this.collection_name)
          .orderByChild(key)
          .equalTo(value)
          .get();

        const results = [];
        const data = snapshot.val();
        if (data) {
          for (const [id, attrs] of Object.entries(data)) {
            results.push(new this(attrs, id));
          }
        }
        return results;
      }

      const snapshot = await this.db.ref(this.collection_name).get();
      const data = snapshot.val();
      const results = [];

      if (data) {
        for (const [id, attrs] of Object.entries(data)) {
          if (Object.entries(conditions).every(([key, val]) => attrs[key] === val)) {
            results.push(new this(attrs, id));
          }
        }
      }
      return results;
    }

    throw new Error(`Unsupported adapter: ${this.adapter}`);
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

  async update(attrs = {}) {
    const modelSchema = schema[this.constructor.model_name];
    for (const key of Object.keys(attrs)) {
      if (!modelSchema.columns[key]) {
        throw new Error(`Unknown attribute '${key}' for model ${this.constructor.model_name}`);
      }
    }

    Object.assign(this.attributes, attrs);
    this.validate_field_types(modelSchema.columns);
    this.validate_required_fields(modelSchema.columns);
    return await this.save();
  }

  static async find_or_upsert_by(attributes = {}, id) {
    if (!id) throw new Error('ID is required for find_or_upsert_by');
    let record = await this.find(id);

    if (record) {
      await record.update(attributes);
    } else {
      record = await this.create(attributes, id);
    }

    return record;
  }

  async destroy() {
    if (!this.id) throw new Error('Cannot destroy record without ID');

    if (this.constructor.adapter === 'firestore') {
      await this.constructor.db.collection(this.constructor.collection_name).doc(this.id).delete();
    } else {
      await this.constructor.db.ref(`${this.constructor.collection_name}/${this.id}`).remove();
    }

    return true;
  }

  async save() {
    if (!this.id) throw new Error('ID is required to save');

    if (this.constructor.adapter === 'firestore') {
      await this.constructor.db.collection(this.constructor.collection_name).doc(this.id).set(this.attributes);
    } else {
      await this.constructor.db.ref(`${this.constructor.collection_name}/${this.id}`).set(this.attributes);
    }

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
}

module.exports = ActiveRecord;
