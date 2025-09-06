import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IPFSUploader } from '../IPFSUploader';

// Mock the useIPFS hook
jest.mock('@/hooks/useIPFS', () => ({
  useIPFS: () => ({
    uploadFile: jest.fn().mockResolvedValue({
      cid: 'QmTestCID123',
      url: 'http://localhost:8080/ipfs/QmTestCID123',
    }),
    uploadJSON: jest.fn().mockResolvedValue({
      cid: 'QmJSONCID456',
      url: 'http://localhost:8080/ipfs/QmJSONCID456',
    }),
    uploading: false,
    error: null,
  }),
}));

describe('IPFSUploader', () => {
  it('renders upload component', () => {
    render(<IPFSUploader />);
    expect(screen.getByText('IPFS Upload')).toBeInTheDocument();
    expect(screen.getByLabelText(/Upload File to IPFS/i)).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const user = userEvent.setup();
    render(<IPFSUploader />);
    
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Upload File to IPFS/i) as HTMLInputElement;
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText(/QmTestCID123/)).toBeInTheDocument();
    });
  });

  it('handles metadata upload', async () => {
    const user = userEvent.setup();
    render(<IPFSUploader />);
    
    const button = screen.getByText('Upload Sample Metadata');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/QmJSONCID456/)).toBeInTheDocument();
    });
  });

  it('displays gateway URL after upload', async () => {
    const user = userEvent.setup();
    render(<IPFSUploader />);
    
    const button = screen.getByText('Upload Sample Metadata');
    await user.click(button);
    
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /localhost:8080/i });
      expect(link).toHaveAttribute('href', 'http://localhost:8080/ipfs/QmJSONCID456');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});