const ApplicationRecord = require('../ApplicationRecord');

class AnimeList extends ApplicationRecord {
  static async update_anime_list(data, animeId, userId) {
    if (!data || !animeId || !userId) {
      throw new Error('Data, Anime ID and User ID are required');
    }

    const ref = this.db.ref(`${this.collection_name}/${userId}/${animeId}`);
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

  static async remove(animeId, userId) {
    if (!animeId || !userId) {
      throw new Error('Anime ID and User ID are required');
    }

    const ref = this.db.ref(`${this.collection_name}/${userId}/${animeId}`);
    await ref.remove();

    const userListSnap = await this.db.ref(`${this.collection_name}/${userId}`).get();
    return userListSnap.exists() ? userListSnap.val() : {};
  }
}

module.exports = AnimeList;
