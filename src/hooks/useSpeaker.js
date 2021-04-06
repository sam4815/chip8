import { useEffect, useRef } from 'react';

const useSpeaker = () => {
  const audio = useRef(
    new (window.AudioContext || window.webkitAudioContext)()
  );
  const gain = useRef(audio.current.createGain());
  const oscillator = useRef(null);

  useEffect(() => {
    const finish = audio.current.destination;
    gain.current.connect(finish);
  }, [audio, gain]);

  const setMute = (mute) => {
    gain.current.setValueAtTime(mute, audio.currentTime);
  };

  const play = (frequency) => {
    if (oscillator.current || !audio.current) return;

    oscillator.current = audio.current.createOscillator();
    oscillator.current.frequency.setValueAtTime(
      frequency || 440,
      audio.current.currentTime
    );
    oscillator.current.type = 'square';
    oscillator.current.connect(gain.current);
    oscillator.current.start();
  };

  const stop = () => {
    if (!oscillator.current) return;

    oscillator.current.stop();
    oscillator.current.disconnect();
    oscillator.current = null;
  };

  return { play, stop, setMute };
};

export default useSpeaker;
