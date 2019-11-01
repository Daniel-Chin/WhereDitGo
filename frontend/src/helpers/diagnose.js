// legacy code from app.js
database.forEach((entry) => {
  if (entry.payload.type === 'tag') {
    const { tag_name, explanation } = entry.payload;
    const tag_0 = getTag(tag_name);
    tag_0.explanation = explanation;
  } else if (entry.payload.type === 'expense') {
    const tag_names = entry.payload.tags;
    tag_names.forEach((name) => {
      const tag_1 = getTag(name);
      const old_amount = tag_1.amounts.get(entry.payload.amount) || 0;
      tag_1.amounts.set(entry.payload.amount, old_amount + 1);
      tag_names.forEach((other_name) => {
        if (other_name !== name) {
          const old = tag_1.correlations.get(other_name) || 0;
          tag_1.correlations.set(other_name, old + 1)
        }
      });
    });
  } else {
    throw new Error(`Illegal payload type "${entry.payload.type}"`);
  }
});
