const top_typer = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const ref = Controller.Concern.firebase_admin.database().ref(`typings/${today}`);

  const snapshot = await ref.once('value');
  const data = snapshot.val();

  if (!data) return null;

  const [username, score] = Object.entries(data).sort((a, b) => b[1] - a[1])[0];

  return { username, score };
};

module.exports = top_typer;
