import axios from 'axios';
import { PORT } from './misc';

const getAllTags = async function () {
  let id = '__head__';
  const tags = new Map();
  let entry;
  while (id !== '__tail__') {
    entry = (await axios.get(`http://localhost:${PORT}/get`, {
      params: {
        whichdb: 'tag', 
        id, 
      }
    })).data;
    if (id !== '__head__') {
      tags.set(entry.payload.id, {
        ...entry.payload, 
        database_id: entry.id,
      });
    }
    id = entry.next;
  }
  return tags;
};

const rankSuggestions = (tagbase, conditionals) => {
  const scoreboard = [];
  tagbase.filter(
    (tag) => (! conditionals.includes(tag))
  ).forEach((tag) => {
    const { count, correlations } = tag;
    scoreboard.push({
      tag, 
      score: conditionals.map(
        (conditional) => (
          correlations.find((correlated) => (
            conditional.id === correlated.id
          )) || { id: conditional.id, count: 0.01 }
        )
      ).reduce((acc, correlated) => (
        acc * correlated.count / count
      ), count), 
    });
  });
  scoreboard.sort((a, b) => (a.score - b.score));
  return scoreboard;
};

const TAG_OPTIMIZE_LEVEL = 5;
const recommendTags = async function (
  tagbase, active_tags, math, currency, 
) {
  const conditionals = [...active_tags];
  const amountTag = tagbase.get(
    parseFloat(math.first).toString() + ' ' + currency
  );
  if (amountTag !== undefined) {
    conditionals.push(amountTag);
  }

  const scoreboard = rankSuggestions(tagbase, conditionals);

  // Don't show what I would show you after you picked sth
  const recommended = [];
  const to_hide = [];
  const hided = [];
  for (let { tag } of scoreboard) {
    if (to_hide.includes(tag)) {
      hided.push(tag);
      continue;
    }
    if (recommended.length < TAG_OPTIMIZE_LEVEL) {
      rankSuggestions(tagbase, [...conditionals, tag])
        .slice(0, TAG_OPTIMIZE_LEVEL)
        .forEach(({ tag }) => {
          to_hide.push(tag);
        });
    }
    recommended.push(tag);
  }
  recommended.push(...hided);
  return recommended;
};

const newTag = async function (type, payload) {
  // add tag and get all tags. Return tag.
};

const updateCorrelation = (original_tags, new_tags) => {

};

export {
  getAllTags, 
  recommendTags, 
  newTag, 
  updateCorrelation, 
};
