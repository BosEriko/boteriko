const TitleGenerator = (initialTitle = "") => {
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

    return [baseTitle, extrasStr].filter(Boolean).join(" | ");
  };

  return {
    append,
    title
  };
};

export default TitleGenerator;
