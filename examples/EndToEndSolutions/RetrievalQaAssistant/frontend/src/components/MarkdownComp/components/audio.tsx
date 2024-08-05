import { useEffect, useRef, useState } from 'react';

import IconFont from '../../IconFont';
import rateImg from '@/assets/images/rate.png';

import styles from './styles.module.less';

export default (props) => {
  const { src } = props;
  const rateRef = useRef<HTMLImageElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState<number | undefined>();
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number>();
  const init = () => {
    audioRef.current = new Audio(src);
    audioRef.current.addEventListener('loadeddata', () => {
      setDuration(audioRef.current?.duration);
    });
  };

  const play = () => {
    if (!audioRef.current) return;
    clearInterval(timer.current);
    audioRef.current.play();
    timer.current = window.setInterval(() => {
      const currentTime = audioRef.current?.currentTime;
      if (currentTime && duration) {
        const rate = 100 - (currentTime / duration) * 100;
        rateRef.current!.style.clipPath = `inset(0px ${rate}% 0px 0px)`;
        if (currentTime >= duration) {
          audioRef.current!.currentTime = 0;
          setPlaying(false);
        }
      }
    }, 50);
  };

  const pause = () => {
    clearInterval(timer.current);
    audioRef.current?.pause();
  };

  useEffect(() => {
    init();
    return () => {
      clearInterval(timer.current);
    };
  }, []);
  useEffect(() => {
    if (!audioRef.current) return;
    playing ? play() : pause();
  }, [playing]);

  return (
    <span className={styles.audioWrapper}>
      <IconFont
        className={styles.markIcon}
        type={playing ? 'icon-zanting1' : 'icon-bofang3'}
        onClick={() => {
          if (!audioRef.current) return;
          setPlaying((pre) => !pre);
        }}
      />
      <span className={styles.progress}>
        <span className={styles.rate} />
        <img
          ref={rateRef}
          className={styles.rate}
          src={rateImg}
        />
      </span>
      <span className={styles.time}>{duration?.toFixed(2)}</span>
    </span>
  );
};
