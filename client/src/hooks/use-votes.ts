import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVotes, vote, VoteResponse } from '@/services/vote-service';
import { BusinessVote } from '@shared/schema';
import { useUsername } from '@/providers/username-provider';

/**
 * Hook for fetching and managing business votes
 */
export function useBusinessVotes(businessId: string) {
  const queryClient = useQueryClient();
  const { username, isUsernameSet } = useUsername();
  
  // Fetch votes for the business
  const votesQuery = useQuery<VoteResponse>({
    queryKey: ['business-votes', businessId],
    queryFn: () => getVotes(businessId),
    // Enable polling for real-time updates
    refetchInterval: 30000, // 30 seconds
    enabled: !!businessId,
  });
  
  // Mutation for submitting a vote
  const voteMutation = useMutation({
    mutationFn: (voteData: BusinessVote) => vote(voteData),
    
    // Optimistic update
    onMutate: async (newVote) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['business-votes', businessId] });
      
      // Snapshot the previous value
      const previousVotes = queryClient.getQueryData<VoteResponse>(['business-votes', businessId]);
      
      // Optimistically update to the new value
      if (previousVotes?.votes) {
        const optimisticVotes = { ...previousVotes };
        
        // Update the user's vote
        if (optimisticVotes.votes) {
          optimisticVotes.votes.userVote = newVote.vote;
          
          // Update like/dislike counts
          if (previousVotes.votes.userVote === 'like' && newVote.vote === 'dislike') {
            // Changed from like to dislike
            optimisticVotes.votes.likes--;
            optimisticVotes.votes.dislikes++;
          } else if (previousVotes.votes.userVote === 'dislike' && newVote.vote === 'like') {
            // Changed from dislike to like
            optimisticVotes.votes.likes++;
            optimisticVotes.votes.dislikes--;
          } else if (previousVotes.votes.userVote === null && newVote.vote === 'like') {
            // New like
            optimisticVotes.votes.likes++;
          } else if (previousVotes.votes.userVote === null && newVote.vote === 'dislike') {
            // New dislike
            optimisticVotes.votes.dislikes++;
          }
        }
        
        queryClient.setQueryData<VoteResponse>(['business-votes', businessId], optimisticVotes);
      }
      
      return { previousVotes };
    },
    
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newVote, context) => {
      if (context?.previousVotes) {
        queryClient.setQueryData<VoteResponse>(
          ['business-votes', businessId],
          context.previousVotes
        );
      }
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['business-votes', businessId] });
    },
  });
  
  return {
    votes: votesQuery.data?.votes,
    isLoading: votesQuery.isLoading,
    error: votesQuery.error,
    submitVote: (voteType: 'like' | 'dislike') => {
      if (!username) return;
      
      const voteData: BusinessVote = {
        businessId,
        username,
        vote: voteType,
        timestamp: Date.now(),
      };
      
      voteMutation.mutate(voteData);
    },
    isUsernameRequired: !isUsernameSet,
  };
}