export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  bio: string;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: any; // Timestamp
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  images: string[];
  videos: string[];
  privacy: 'public' | 'friends' | 'only_me';
  status: 'pending' | 'approved' | 'rejected';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: any;
  updatedAt: any;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: any;
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'text';
  expiresAt: any;
  createdAt: any;
}
