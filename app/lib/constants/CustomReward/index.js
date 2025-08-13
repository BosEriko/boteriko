const String = require("../String");

const icon = (rewardName) => ({
  size_28: `https://server.boseriko.com/images/custom_reward/${rewardName}/size_28.png`,
  size_56: `https://server.boseriko.com/images/custom_reward/${rewardName}/size_56.png`,
  size_112: `https://server.boseriko.com/images/custom_reward/${rewardName}/size_112.png`
});

const CustomReward = [
  {
    is_enabled: true,
    title: String.ADD_TO_QUEUE,
    prompt: "Add something to the music player — Spotify links supported!",
    is_user_input_required: true,
    cost: 50,
    icon: icon("ADD_TO_QUEUE"),
    background_color: "#1DB954",
    should_redemptions_skip_request_queue: false,
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 60,
    is_max_per_stream_enabled: false,
    max_per_stream: 0,
    is_max_per_user_per_stream_enabled: false,
    max_per_user_per_stream: 0
  },
  {
    is_enabled: true,
    title: String.BLINK,
    prompt: "Make me blink!",
    is_user_input_required: false,
    cost: 50,
    icon: icon("BLINK"),
    background_color: "#8880FF",
    should_redemptions_skip_request_queue: true,
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 300,
    is_max_per_stream_enabled: false,
    max_per_stream: 0,
    is_max_per_user_per_stream_enabled: false,
    max_per_user_per_stream: 0
  },
  {
    is_enabled: true,
    title: String.STRETCH,
    prompt: "Stretch my bones!",
    is_user_input_required: false,
    cost: 150,
    icon: icon("STRETCH"),
    background_color: "#FFA1B3",
    should_redemptions_skip_request_queue: true,
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 900,
    is_max_per_stream_enabled: false,
    max_per_stream: 0,
    is_max_per_user_per_stream_enabled: false,
    max_per_user_per_stream: 0
  },
];

module.exports = CustomReward;
