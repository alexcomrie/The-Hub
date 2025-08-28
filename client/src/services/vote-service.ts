import { BusinessVote } from '@shared/schema';

// API endpoint for votes
const VOTE_API_URL = 'https://script.google.com/macros/s/AKfycbwswnOZV1kZjYMvNZ-09fivoFBDU3TTEDE9ij_oh-izfTPQpGT_DroN8T4I3rbNSM2Z/exec';

// Response interface for vote API
export interface VoteResponse {
  success: boolean;
  message: string;
  votes?: {
    businessId: string;
    likes: number;
    dislikes: number;
    userVote?: 'like' | 'dislike' | null;
  };
}

/**
 * Fetches vote data for a specific business
 */
export async function getVotes(businessId: string): Promise<VoteResponse> {
  try {
    // Get username from localStorage
    const username = localStorage.getItem('username') || '';
    
    const url = new URL(VOTE_API_URL);
    url.searchParams.append('action', 'getVotes');
    url.searchParams.append('businessId', businessId);
    url.searchParams.append('username', username);
    
    const response = await fetch(url.toString(), {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch votes: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch votes');
    }
    return data;
  } catch (error) {
    console.error('Error fetching votes:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Submits a vote (like or dislike) for a business
 */
export async function vote(vote: BusinessVote): Promise<VoteResponse> {
  try {
    const url = new URL(VOTE_API_URL);
    const body = { action: 'vote', ...vote };
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit vote: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to submit vote');
    }
    return data;
  } catch (error) {
    console.error('Error submitting vote:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}