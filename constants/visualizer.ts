export interface BarConfig {
  delay: number;
  peak: number;
  dur: number;
}

export const BAR_CONFIGS: BarConfig[] = [
  { delay: 0, peak: 30, dur: 280 },
  { delay: 80, peak: 44, dur: 360 },
  { delay: 40, peak: 24, dur: 220 },
  { delay: 130, peak: 38, dur: 305 },
  { delay: 20, peak: 50, dur: 400 },
  { delay: 110, peak: 22, dur: 245 },
  { delay: 60, peak: 42, dur: 340 },
];
