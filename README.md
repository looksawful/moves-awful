# MovesAwful

vanilla canvas animations with images and labels

- **Arc** — movement along an arc with smooth fade at the start of the trajectory

  | Parameter        | Description                           |
  | ---------------- | ------------------------------------- |
  | `slots`          | number of visible cards on the arc    |
  | `speed`          | scroll speed                          |
  | `radiusScale`    | arc radius relative to canvas size    |
  | `cardBaseScale`  | base card size                        |
  | `cardMinScale`   | minimum scale (arc edges)             |
  | `cardMaxBonus`   | scale multiplier at center            |
  | `cardFocusPower` | sharpness of scale transition         |
  | `titleScale`     | label font size                       |
  | `titleOffsetY`   | vertical label offset inside card     |
  | `titleMaxWidth`  | max text width in card widths         |
  | `edgeFadeStart`  | position where edge fade begins (0–1) |
  | `edgeFadePower`  | sharpness of edge fade                |

- **Spiral** — movement along a spiral

  | Parameter         | Description                            |
  | ----------------- | -------------------------------------- |
  | `speed`           | scroll speed                           |
  | `turns`           | number of spiral turns                 |
  | `cardScale`       | base card size                         |
  | `cardGrowthScale` | how much cards grow towards the center |
  | `radiusScale`     | spiral radius relative to canvas size  |
  | `alphaScale`      | how much cards fade towards the edges  |

## Links

- [Preview](https://looksawful.github.io/moves-awful/)

## Getting started

```bash
npm install
npm run dev
```
