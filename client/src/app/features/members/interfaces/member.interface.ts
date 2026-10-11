  export interface Member {
  id: string;
  email: string;
  gender: string;
  dateOfBirth: string; // Keep as string (YYYY-MM-DD) for API serialization
  displayName: string;
  created: string;
  lastActive: string;
  bio: string | null;
  city: string;
  country: string;
  photoUrl: string | null;
  age: number;
}

export interface Photo {
  id: number;
  url: string;
  isMain: boolean;
  memberId: string;
  publicId: string | null;
}

export interface UpdateMember {
  displayName: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  country: string;
  bio: string;
}

export interface MemberFilters {
  gender?: string;
  minAge?: number;
  maxAge?: number;
  orderBy?:
    | 'lastActive'
    | 'lastActiveAsc'
    | 'created'
    | 'createdAsc'
    | 'displayName'
    | 'displayNameDesc';
}