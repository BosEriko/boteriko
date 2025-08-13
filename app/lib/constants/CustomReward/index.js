const String = require("../String");

const CustomReward = [
  {
    is_enabled: true,
    title: String.ADD_TO_QUEUE,
    prompt: "Add something to the music player — Spotify links supported!",
    is_user_input_required: true,
    cost: 50,
    icon: {
      size_28: "https://i.imgur.com/CweZChK.png",
      size_56: "https://i.imgur.com/4S6Xrfl.png",
      size_112: "https://i.imgur.com/cc9H5pV.png"
    },
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
    icon: {
      size_28: "https://i.imgur.com/JmqyRgD.png",
      size_56: "https://i.imgur.com/UGmsDBH.png",
      size_112: "https://i.imgur.com/lpw8T1k.png"
    },
    background_color: "#8880FF",
    should_redemptions_skip_request_queue: true,
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 300,
    is_max_per_stream_enabled: false,
    max_per_stream: 0,
    is_max_per_user_per_stream_enabled: false,
    max_per_user_per_stream: 0
  },
];

module.exports = CustomReward;
