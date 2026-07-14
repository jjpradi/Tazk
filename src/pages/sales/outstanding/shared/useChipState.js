import { useState } from 'react';

/**
 * Manages a mutually-exclusive chip selection (only one chip "true" at a time)
 * plus a parallel `activeChip` string for code that wants the active key directly.
 *
 * initialState: { [chipKey: string]: boolean } - the full set of chips with their initial selected flags
 */
export default function useChipState(initialState) {
  const [selectedChip, setSelectedChip] = useState(initialState);
  const initialActive = Object.keys(initialState).find((k) => initialState[k]) || '';
  const [activeChip, setActiveChip] = useState(initialActive);

  const selectChip = (chip) => {
    const next = Object.keys(initialState).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
    next[chip] = true;
    setSelectedChip(next);
    setActiveChip(chip);
  };

  return { selectedChip, activeChip, selectChip, setSelectedChip, setActiveChip };
}
