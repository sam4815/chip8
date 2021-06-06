import { useEffect, useRef } from 'react';

const useSpeaker = () => {
  const audio = useRef(
    new (window.AudioContext || window.webkitAudioContext)()
  );
  const soundBuffers = useRef([]);
  const playing = useRef(false);

  useEffect(() => {
    const fetchSounds = async () => {
      const buffers = await Promise.all(
        Array.from({ length: 3 }).map(async (_, i) => {
          const request = await fetch(
            `${process.env.PUBLIC_URL}/mallet${i + 1}.mp3`
          );
          const arrayBuffer = await request.arrayBuffer();
          return audio.current.decodeAudioData(arrayBuffer);
        })
      );

      soundBuffers.current = buffers;
    };

    fetchSounds();
  }, []);

  const play = () => {
    if (playing.current || !audio.current) return;

    const source = audio.current.createBufferSource();
    const buffers = soundBuffers.current;
    source.buffer = buffers[Math.floor(Math.random() * buffers.length)];
    source.connect(audio.current.destination);
    source.start();

    playing.current = true;
    setTimeout(() => (playing.current = false), 100);
  };

  return { play };
};

export default useSpeaker;
