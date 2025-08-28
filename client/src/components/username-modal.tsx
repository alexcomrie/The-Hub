import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useUsername } from '../providers/username-provider';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsernameModal({ isOpen, onClose }: UsernameModalProps) {
  const { setUsername } = useUsername();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (!inputValue.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    if (inputValue.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (inputValue.trim().length > 30) {
      setError('Username must be less than 30 characters');
      return;
    }
    
    // Set username and close modal
    setUsername(inputValue.trim());
    setInputValue('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Your Username</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              id="username"
              placeholder="Enter your username"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError(null);
              }}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-sm text-muted-foreground">
              Your username will be displayed with your reviews and votes.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="submit">Save Username</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}