export interface VideoResponse {
  broadcastType: string;
  createdAt: string;
  seekPreviewsURL: string;
  owner: {
    login: string;
  };
  title: string;
}
