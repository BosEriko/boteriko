const platform_router = require("../../concerns/platform_router");

const twitch = async (user, mention = null) => {
  const taggedUserName = mention.trim() ? mention.trim().split(' ')[0].replace(/^<@!?(\d+)>$/, '$1').replace(/^@/, '') : null;
  if (taggedUserName) {
    const userData = await Model.User.find_by({ displayName: taggedUserName });
    if (!userData) return `No data found for ${taggedUserName}.`;
    if (!userData?.attributes?.isRegistered) return `${taggedUserName} is not registered yet.`;
    return `${taggedUserName}'s profile can be found here: ${Config.app.clientUrl}/user/${userData.id}`;
  } else {
    const userData = await Model.User.find(user['user-id']);
    if (!userData) return `You still don't have any data, ${user['display-name']}.`;
    if (!userData?.attributes?.isRegistered) return `You are not registered yet, ${user['display-name']}. Here is your personalize invitation: ${Config.app.clientUrl}/join/${userData.id}`;
    return `Hey, ${user['display-name']}! Your profile can be found here: ${Config.app.clientUrl}/user/${userData.id}`;
  }
}

const discord = async (user, mention = null) => {
  const taggedUserId = mention.trim() ? mention.trim().split(' ')[0].replace(/^<@!?(\d+)>$/, '$1').replace(/^@/, '') : null;
  if (taggedUserId) {
    const userConnection = await Model.Connection.find_by({ discord: taggedUserId });
    if (!userConnection?.attributes?.discord) return `No connected BosEriko+ account. Login and connect your account here: ${Config.app.clientUrl}/setting`;
    const userData = await Model.User.find(userConnection.id);
    if (!userData) return `No data found.`;
    if (!userData?.attributes?.isRegistered) return `${userData?.attributes?.displayName} is not registered yet.`;
    return `${userData?.attributes?.displayName}'s profile can be found here: ${Config.app.clientUrl}/user/${userData.id}`;
  } else {
    const userConnection = await Model.Connection.find_by({ discord: user.id });
    if (!userConnection?.attributes?.discord) return `Hey, ${user.globalName}! You don't have any connected BosEriko+ account. Login and connect your account here: ${Config.app.clientUrl}/setting`;
    const userData = await Model.User.find(userConnection.id);
    if (!userData) return `You still don't have any data, ${user.globalName}.`;
    if (!userData?.attributes?.isRegistered) return `You are not registered yet, ${user.globalName}. Here is your personalize invitation: ${Config.app.clientUrl}/join/${userData.id}`;
    return `Hey, ${user.globalName}! Your profile can be found here: ${Config.app.clientUrl}/user/${userData.id}`;
  }
}

const profile = platform_router({ twitch, discord });

module.exports = profile;
