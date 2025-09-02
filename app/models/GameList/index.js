const ApplicationRecord = require('../ApplicationRecord');

class GameList extends ApplicationRecord {
  static async update_game_list(data, gameId, userId) {
    if (!data || !gameId || !userId) {
      throw new Error('Data, Game ID and User ID are required');
    }

    const ref = this.db.ref(`${this.collection_name}/${userId}/${gameId}`);
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

  static async remove(gameId, userId) {
    if (!gameId || !userId) {
      throw new Error('Game ID and User ID are required');
    }

    const ref = this.db.ref(`${this.collection_name}/${userId}/${gameId}`);
    await ref.remove();

    const userListSnap = await this.db.ref(`${this.collection_name}/${userId}`).get();
    return userListSnap.exists() ? userListSnap.val() : {};
  }
}

module.exports = GameList;
