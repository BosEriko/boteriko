const MAX_TITLE_LENGTH = 140;

const truncate = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

const title_generator = (initialTitle = "") => {
  const parts = initialTitle.split(" | ");
  const baseTitle = parts[0];
  const extras = {};

  for (let i = 1; i < parts.length; i++) {
    const [label, ...rest] = parts[i].split(":");
    if (label && rest.length > 0) {
      extras[label.trim()] = rest.join(":").trim();
    }
  }

  const append = (label, value) => {
    extras[label] = value;
    return title();
  };

  const title = () => {
    const extrasStr = Object.entries(extras)
      .map(([label, value]) => `${label}: ${value}`)
      .join(" | ");

    const extrasWithSeparator = extrasStr ? ` | ${extrasStr}` : "";

    const allowedBaseLength =
      MAX_TITLE_LENGTH - extrasWithSeparator.length;

    const finalBaseTitle = truncate(baseTitle, allowedBaseLength);

    return `${finalBaseTitle}${extrasWithSeparator}`;
  };

  return {
    append,
    title
  };
};

module.exports = title_generator;
