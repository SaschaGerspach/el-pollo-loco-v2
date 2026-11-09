const BACKGROUND_PATH = "assets/images/background";

export const SKY = {
  key: "background-sky",
  path: `${BACKGROUND_PATH}/air.png`,
};

// Back to front. Parallax 1 moves with the ground Pepe walks on; drift is in px per second.
export const BACKGROUND_LAYERS = [
  {
    key: "background-clouds",
    path: `${BACKGROUND_PATH}/clouds/full.png`,
    parallax: 0.1,
    drift: 13,
  },
  {
    key: "background-layer-3",
    path: `${BACKGROUND_PATH}/layer-3/full.png`,
    parallax: 0.25,
    drift: 0,
  },
  {
    key: "background-layer-2",
    path: `${BACKGROUND_PATH}/layer-2/full.png`,
    parallax: 0.5,
    drift: 0,
  },
  {
    key: "background-layer-1",
    path: `${BACKGROUND_PATH}/layer-1/full.png`,
    parallax: 1,
    drift: 0,
  },
] as const;
