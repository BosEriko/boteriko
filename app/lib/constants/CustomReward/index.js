const String = require("../String");

const icon = (rewardName) => ({
  size_28: `https://server.boseriko.com/images/custom_reward/${rewardName}/size_28.png`,
  size_56: `https://server.boseriko.com/images/custom_reward/${rewardName}/size_56.png`,
  size_112: `https://server.boseriko.com/images/custom_reward/${rewardName}/size_112.png`
});

const CustomReward = [
  {
    is_enabled: true,
    // General Information
    title: String.ADD_TO_QUEUE,
    prompt: "Add something to the music player — Spotify links supported!",
    is_user_input_required: true,
    cost: 50,
    // Reward Icon
    icon: icon("ADD_TO_QUEUE"),
    // Background Color
    background_color: "#1DB954",
    // Skip Reward Requests Queue
    should_redemptions_skip_request_queue: false,
    // Cooldown & Limits
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 60,
    is_max_per_stream_enabled: false,
    max_per_stream: 0,
    is_max_per_user_per_stream_enabled: false,
    max_per_user_per_stream: 0
  },
  {
    is_enabled: true,
    // General Information
    title: String.BLINK,
    prompt: "Make me blink!",
    is_user_input_required: false,
    cost: 50,
    // Reward Icon
    icon: icon("BLINK"),
    // Background Color
    background_color: "#8880FF",
    // Skip Reward Requests Queue
    should_redemptions_skip_request_queue: true,
    // Cooldown & Limits
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 300,
    is_max_per_stream_enabled: false,
    max_per_stream: 0,
    is_max_per_user_per_stream_enabled: false,
    max_per_user_per_stream: 0
  },
  {
    is_enabled: true,
    // General Information
    title: String.STRETCH,
    prompt: "Stretch my bones!",
    is_user_input_required: false,
    cost: 150,
    // Reward Icon
    icon: icon("STRETCH"),
    // Background Color
    background_color: "#FFA1B3",
    // Skip Reward Requests Queue
    should_redemptions_skip_request_queue: true,
    // Cooldown & Limits
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 900,
    is_max_per_stream_enabled: false,
    max_per_stream: 0,
    is_max_per_user_per_stream_enabled: false,
    max_per_user_per_stream: 0
  },
  {
    is_enabled: true,
    // General Information
    title: String.HYDRATE,
    prompt: "Quench my thirst!",
    is_user_input_required: false,
    cost: 300,
    // Reward Icon
    icon: icon("HYDRATE"),
    // Background Color
    background_color: "#76FFDB",
    // Skip Reward Requests Queue
    should_redemptions_skip_request_queue: true,
    // Cooldown & Limits
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 1800,
    is_max_per_stream_enabled: false,
    max_per_stream: 0,
    is_max_per_user_per_stream_enabled: false,
    max_per_user_per_stream: 0
  },
  {
    is_enabled: true,
    // General Information
    title: String.STAND_UP,
    prompt: "Make me taller!",
    is_user_input_required: false,
    cost: 300,
    // Reward Icon
    icon: icon("STAND_UP"),
    // Background Color
    background_color: "#392e5c",
    // Skip Reward Requests Queue
    should_redemptions_skip_request_queue: true,
    // Cooldown & Limits
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 1800,
    is_max_per_stream_enabled: false,
    max_per_stream: 0,
    is_max_per_user_per_stream_enabled: false,
    max_per_user_per_stream: 0
  },
  {
    is_enabled: true,
    // General Information
    title: String.STREAM_WEBSITE_DEVELOPMENT,
    prompt: "Give me ideas what to make and let's do it!",
    is_user_input_required: true,
    cost: 250000,
    // Reward Icon
    icon: icon("STREAM_WEBSITE_DEVELOPMENT"),
    // Background Color
    background_color: "#EB7272",
    // Skip Reward Requests Queue
    should_redemptions_skip_request_queue: false,
    // Cooldown & Limits
    is_global_cooldown_enabled: false,
    global_cooldown_seconds: 0,
    is_max_per_stream_enabled: false,
    max_per_stream: 0,
    is_max_per_user_per_stream_enabled: false,
    max_per_user_per_stream: 0
  },
];

module.exports = CustomReward;
