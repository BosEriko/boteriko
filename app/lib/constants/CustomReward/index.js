const CustomReward = [
  {
    is_enabled: true,
    title: "Add to Queue",
    prompt: "Add something to the music player — YouTube and Spotify links supported!",
    is_user_input_required: true,
    cost: 50,
    background_color: "#1DB954",
    should_redemptions_skip_request_queue: false,
    is_max_per_stream_enabled: false,
    is_max_per_user_per_stream_enabled: false,
    is_global_cooldown_enabled: true,
    global_cooldown_seconds: 60,
  },
];

module.exports = CustomReward;
