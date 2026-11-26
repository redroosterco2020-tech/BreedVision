// محاسبه ضریب همخونی از شجره (روش خویشاوندی/kinship)
export function buildPedigree(breeders) {
  const byId = {};
  (breeders || []).forEach((b) => { byId[b.id] = b; });
  const par = (id) => {
    const b = byId[id];
    if (!b) return [null, null];
    return [byId[b.sireId] ? b.sireId : null, byId[b.damId] ? b.damId : null];
  };

  const levelMemo = {};
  const level = (id, stack = new Set()) => {
    if (!id || !byId[id]) return 0;
    if (id in levelMemo) return levelMemo[id];
    if (stack.has(id)) return 0;
    stack.add(id);
    const [s, d] = par(id);
    const l = s || d ? 1 + Math.max(level(s, stack), level(d, stack)) : 0;
    stack.delete(id);
    levelMemo[id] = l;
    return l;
  };

  const kmemo = {};
  const kin = (x, y, depth = 0) => {
    if (!x || !y || depth > 60) return 0;
    const key = String(x) < String(y) ? x + "|" + y : y + "|" + x;
    if (key in kmemo) return kmemo[key];
    let r;
    if (x === y) {
      const [s, d] = par(x);
      r = 0.5 * (1 + kin(s, d, depth + 1));
    } else {
      let a = x, b = y;
      if (level(a) < level(b)) [a, b] = [b, a];
      if (level(a) === 0) r = 0;
      else {
        const [s, d] = par(a);
        r = 0.5 * (kin(s, b, depth + 1) + kin(d, b, depth + 1));
      }
    }
    kmemo[key] = r;
    return r;
  };

  return {
    byId,
    pairF: (sireId, damId) => kin(sireId, damId),
    selfF: (id) => { const [s, d] = par(id); return kin(s, d); },
    knownParents: (id) => { const [s, d] = par(id); return (s ? 1 : 0) + (d ? 1 : 0); },
  };
}
