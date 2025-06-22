const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ITEMS = 20;

function createCache(ttlMs = DEFAULT_TTL_MS) {
  const cache = new Map();

  function getKey(id, namespace = '') {
    return namespace ? `${namespace}:${id}` : `${id}`;
  }

  function set(id, value, namespace = '') {
    const key = getKey(id, namespace);
    const expiresAt = Date.now() + ttlMs;

    if (!cache.has(key) && cache.size >= MAX_ITEMS) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, { value, expiresAt });
  }

  function get(id, namespace = '') {
    const key = getKey(id, namespace);
    const cached = cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    cache.delete(key);
    return null;
  }

  return { set, get, _raw: cache };
}

module.exports = createCache;
