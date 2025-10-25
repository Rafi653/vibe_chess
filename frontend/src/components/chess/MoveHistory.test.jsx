import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MoveHistory from './MoveHistory';
import useGameStore from '../../store/gameStore';

// Mock the gameStore hook
vi.mock('../../store/gameStore', () => ({
  default: vi.fn(),
}));

describe('MoveHistory Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should render "No moves yet" when move history is empty', () => {
    useGameStore.mockReturnValue({ moveHistory: [] });
    
    render(<MoveHistory />);
    
    expect(screen.getByText('No moves yet')).toBeInTheDocument();
  });

  it('should render move history title', () => {
    useGameStore.mockReturnValue({ moveHistory: [] });
    
    render(<MoveHistory />);
    
    expect(screen.getByText('Move History')).toBeInTheDocument();
  });

  it('should render single move pair', () => {
    const moveHistory = [
      { san: 'e4', color: 'w' },
      { san: 'e5', color: 'b' },
    ];
    useGameStore.mockReturnValue({ moveHistory });
    
    render(<MoveHistory />);
    
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('e4')).toBeInTheDocument();
    expect(screen.getByText('e5')).toBeInTheDocument();
  });

  it('should render multiple move pairs', () => {
    const moveHistory = [
      { san: 'e4', color: 'w' },
      { san: 'e5', color: 'b' },
      { san: 'Nf3', color: 'w' },
      { san: 'Nc6', color: 'b' },
    ];
    useGameStore.mockReturnValue({ moveHistory });
    
    render(<MoveHistory />);
    
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('e4')).toBeInTheDocument();
    expect(screen.getByText('e5')).toBeInTheDocument();
    expect(screen.getByText('Nf3')).toBeInTheDocument();
    expect(screen.getByText('Nc6')).toBeInTheDocument();
  });

  it('should handle odd number of moves', () => {
    const moveHistory = [
      { san: 'e4', color: 'w' },
      { san: 'e5', color: 'b' },
      { san: 'Nf3', color: 'w' },
    ];
    useGameStore.mockReturnValue({ moveHistory });
    
    render(<MoveHistory />);
    
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('Nf3')).toBeInTheDocument();
  });

  it('should display complex moves with special notation', () => {
    const moveHistory = [
      { san: 'e4', color: 'w' },
      { san: 'c5', color: 'b' },
      { san: 'Nf3', color: 'w' },
      { san: 'd6', color: 'b' },
      { san: 'd4', color: 'w' },
      { san: 'cxd4', color: 'b' },
      { san: 'Nxd4', color: 'w' },
      { san: 'Nf6', color: 'b' },
    ];
    useGameStore.mockReturnValue({ moveHistory });
    
    render(<MoveHistory />);
    
    // Check for captures
    expect(screen.getByText('cxd4')).toBeInTheDocument();
    expect(screen.getByText('Nxd4')).toBeInTheDocument();
  });

  it('should display check and checkmate notation', () => {
    const moveHistory = [
      { san: 'e4', color: 'w' },
      { san: 'e5', color: 'b' },
      { san: 'Qh5', color: 'w' },
      { san: 'Ke7', color: 'b' },
      { san: 'Qxe5#', color: 'w' },
    ];
    useGameStore.mockReturnValue({ moveHistory });
    
    render(<MoveHistory />);
    
    expect(screen.getByText('Qxe5#')).toBeInTheDocument();
  });
});
