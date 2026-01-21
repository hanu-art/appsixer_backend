
const STATUS = Object.freeze({
  NEW: 'new',
  CONTACTED: 'contacted',
  RESOLVED: 'resolved',
});

const STATUSES = Object.freeze([STATUS.NEW, STATUS.CONTACTED, STATUS.RESOLVED]);
const STATUS_SET = new Set(STATUSES);

const NEXT_MAP = Object.freeze({
  [STATUS.NEW]: STATUS.CONTACTED,
  [STATUS.CONTACTED]: STATUS.RESOLVED,
  [STATUS.RESOLVED]: null,
});

const isValidStatus = (value) =>
  typeof value === 'string' && STATUS_SET.has(value);

const assertValidStatus = (value) => {
  if (!isValidStatus(value)) {
    const err = new Error(`Invalid contact status: ${String(value)}`);
    err.name = 'InvalidStatusError';
    throw err;
  }
};

const getNextStatus = (current) => {
  assertValidStatus(current);
  return NEXT_MAP[current] || null;
};

const isTransitionAllowed = (current, next) => {
  assertValidStatus(current);
  assertValidStatus(next);
  return NEXT_MAP[current] === next;
};

const assertTransitionAllowed = (current, next) => {
  if (!isTransitionAllowed(current, next)) {
    const err = new Error(
      `Invalid status transition: ${String(current)} -> ${String(next)}`
    );
    err.name = 'InvalidTransitionError';
    throw err;
  }
};

export {
  STATUS,
  STATUSES,
  isValidStatus,
  assertValidStatus,
  getNextStatus,
  isTransitionAllowed,
  assertTransitionAllowed,
};
