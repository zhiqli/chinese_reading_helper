/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    audioManager: any;
    currentTrack: any;
    isPlaying: boolean;
    playlist: any[];
    currentIndex: number;
  }
}