export type VodMetadata = {
  owner: string;
  title: string;
  videos: VideoUrl[];
};

export type VideoUrl = {
  url?: string;
  quality: string;
  fps: number;
};
