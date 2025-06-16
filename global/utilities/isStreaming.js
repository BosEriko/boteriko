function isStreamingUtility() {
  const start = parseInt(process.env.STREAM_START, 10);
  const end = parseInt(process.env.STREAM_END, 10);
  const currentHour = new Date().getHours();
  return currentHour >= start && currentHour < end;
}

module.exports = isStreamingUtility;
