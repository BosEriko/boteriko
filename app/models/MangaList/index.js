const ApplicationRecord = require('../ApplicationRecord');

class MangaList extends ApplicationRecord {
  static async update_manga_list(data, mangaId, userId) {
    if (!data || !mangaId || !userId) {
      throw new Error('Data, Manga ID and User ID are required');
    }

    const ref = this.db.ref(`${this.collection_name}/${userId}/${mangaId}`);
    const snapshot = await ref.get();

    let finalData;
    if (snapshot.exists()) {
      const existing = snapshot.val();
      finalData = { ...existing, ...data };
    } else {
      finalData = data;
    }

    await ref.set(finalData);
    return finalData;
  }

  static async remove(mangaId, userId) {
    if (!mangaId || !userId) {
      throw new Error('Manga ID and User ID are required');
    }

    const ref = this.db.ref(`${this.collection_name}/${userId}/${mangaId}`);
    await ref.remove();

    const userListSnap = await this.db.ref(`${this.collection_name}/${userId}`).get();
    return userListSnap.exists() ? userListSnap.val() : {};
  }
}

module.exports = MangaList;
