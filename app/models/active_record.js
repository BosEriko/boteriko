const env = require('@config/environments/base');
const {
  getFirestore,
  getDatabase,
  initializeApp,
  apps,
  credential
} = require('firebase-admin');
const schema = require('@db/schema');

if (!apps.length) {
  initializeApp({
    credential: credential.cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    }),
    databaseURL: `https://${env.firebase.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app/`
  });
}

class ActiveRecord {
  constructor(attributes = {}) {
    const modelName = this.constructor.modelName;
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

    this.validateRequiredFields(modelSchema.columns);
  }

  static get modelName() {
    return this.name.toLowerCase() + 's';
  }

  static get adapter() {
    const modelSchema = schema[this.modelName];
    if (!modelSchema) throw new Error(`Missing schema for model: ${this.modelName}`);
    return modelSchema.type;
  }

  static get db() {
    return this.adapter === 'firestore' ? getFirestore() : getDatabase();
  }

  static get collectionName() {
    return this.modelName;
  }

  static async find(id) {
    if (this.adapter === 'firestore') {
      const doc = await this.db.collection(this.collectionName).doc(id).get();
      return doc.exists ? new this({ id, ...doc.data() }) : null;
    } else {
      const snapshot = await this.db.ref(`${this.collectionName}/${id}`).get();
      return snapshot.exists() ? new this({ id, ...snapshot.val() }) : null;
    }
  }

  async save() {
    const id = this.attributes.id || this.constructor.generateId();

    if (this.constructor.adapter === 'firestore') {
      await this.constructor.db.collection(this.constructor.collectionName).doc(id).set(this.attributes);
    } else {
      await this.constructor.db.ref(`${this.constructor.collectionName}/${id}`).set(this.attributes);
    }

    this.attributes.id = id;
    return this;
  }

  validateRequiredFields(columns) {
    for (const [key, def] of Object.entries(columns)) {
      if (def.required && (this.attributes[key] === undefined || this.attributes[key] === null)) {
        throw new Error(`Missing required field: ${key}`);
      }
    }
  }

  static generateId() {
    return Math.random().toString(36).substring(2, 10);
  }
}

module.exports = ActiveRecord;
