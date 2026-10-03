  export interface Member {
  id: string;
  email: string;
  gender: string;
  dateOfBirth: string; // Keep as string (YYYY-MM-DD) for API serialization
  displayName: string;
  created: string;
  lastActive: string;
  bio: string;
  city: string;
  country: string;
  photoUrl: string;
  age: number;
}

export interface Photo {
  id: number;
  url: string;
  isMain: boolean;
  memberId: string;
  publicId: string | null;
}