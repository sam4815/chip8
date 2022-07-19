import { useEffect, useRef } from 'react';

const useSpeaker = () => {
  const audio = useRef(
    new (window.AudioContext || window.webkitAudioContext)()
  );
  const soundBuffers = useRef([]);
  const playing = useRef(false);

  useEffect(() => {
    const fetchSound = async () => {
      const request = await fetch(`${process.env.PUBLIC_URL}/beat.mp3`);
      const arrayBuffer = await request.arrayBuffer();
      const buffer = await audio.current.decodeAudioData(arrayBuffer);

      soundBuffers.current = buffer;
    };

    fetchSound();
  }, []);

  const play = () => {
    if (playing.current || !audio.current) return;

    const source = audio.current.createBufferSource();
    source.buffer = soundBuffers.current;
    source.connect(audio.current.destination);
    source.start();

    playing.current = true;
    setTimeout(() => (playing.current = false), 100);
  };

  return { play };
};

export default useSpeaker;
