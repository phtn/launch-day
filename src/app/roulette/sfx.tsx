import useSound from "use-sound";

export const useSFX = () => {
  const defaultOption = {
    volume: 0.8,
    interrupt: true,
  };

  const [placeBetSFX] = useSound("/sfx/coin.mp3", {
    volume: 1.5,
    interrupt: true,
  });

  const [winSFX] = useSound("/sfx/win.wav", defaultOption);
  const [loseSFX] = useSound("/sfx/lose.mp3", defaultOption);
  const [errorSFX] = useSound("/sfx/error.wav", defaultOption);
  const [startSFX] = useSound("/sfx/start.wav", defaultOption);
  const [betBigSFX] = useSound("/sfx/bet-big.mp3", defaultOption);
  const [removeBetSFX] = useSound("/sfx/remove.wav", defaultOption);
  const [clearBetsSFX] = useSound("/sfx/clear-bets.wav", defaultOption);
  const [repeatBetSFX] = useSound("/sfx/clink.wav", defaultOption);
  const [chipSelectSFX] = useSound("/sfx/chip-select.wav", defaultOption);
  const [notAllowedSFX] = useSound("/sfx/not-allowed.mp3", defaultOption);
  const [rouletteSpinSFX] = useSound("/sfx/roulette-spin.mp3", defaultOption);

  return {
    winSFX,
    loseSFX,
    startSFX,
    errorSFX,
    betBigSFX,
    placeBetSFX,
    removeBetSFX,
    clearBetsSFX,
    repeatBetSFX,
    chipSelectSFX,
    notAllowedSFX,
    rouletteSpinSFX,
  };
};
