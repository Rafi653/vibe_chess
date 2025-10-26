import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MoveNavigation from './MoveNavigation';
import useGameStore from '../../store/gameStore';

// Mock the game store
vi.mock('../../store/gameStore');

describe('MoveNavigation', () => {
  const mockNavigateToMove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when game is not over', () => {
    useGameStore.mockReturnValue({
      moveHistory: [
        { san: 'e4', from: 'e2', to: 'e4' },
        { san: 'e5', from: 'e7', to: 'e5' },
      ],
      gameOver: false,
      navigateToMove: mockNavigateToMove,
      currentMoveIndex: undefined,
    });

    const { container } = render(<MoveNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when there are no moves', () => {
    useGameStore.mockReturnValue({
      moveHistory: [],
      gameOver: true,
      navigateToMove: mockNavigateToMove,
      currentMoveIndex: undefined,
    });

    const { container } = render(<MoveNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it('should render navigation controls when game is over with moves', () => {
    useGameStore.mockReturnValue({
      moveHistory: [
        { san: 'e4', from: 'e2', to: 'e4' },
        { san: 'e5', from: 'e7', to: 'e5' },
      ],
      gameOver: true,
      navigateToMove: mockNavigateToMove,
      currentMoveIndex: undefined,
    });

    render(<MoveNavigation />);
    
    expect(screen.getByText('Move Navigation')).toBeInTheDocument();
    expect(screen.getByTitle('First move (Home)')).toBeInTheDocument();
    expect(screen.getByTitle('Previous move (←)')).toBeInTheDocument();
    expect(screen.getByTitle('Next move (→)')).toBeInTheDocument();
    expect(screen.getByTitle('Last move (End)')).toBeInTheDocument();
  });

  it('should display current move position', () => {
    useGameStore.mockReturnValue({
      moveHistory: [
        { san: 'e4', from: 'e2', to: 'e4' },
        { san: 'e5', from: 'e7', to: 'e5' },
      ],
      gameOver: true,
      navigateToMove: mockNavigateToMove,
      currentMoveIndex: 1,
    });

    render(<MoveNavigation />);
    
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('should call navigateToMove when clicking first button', () => {
    useGameStore.mockReturnValue({
      moveHistory: [
        { san: 'e4', from: 'e2', to: 'e4' },
        { san: 'e5', from: 'e7', to: 'e5' },
      ],
      gameOver: true,
      navigateToMove: mockNavigateToMove,
      currentMoveIndex: 2,
    });

    render(<MoveNavigation />);
    
    const firstButton = screen.getByTitle('First move (Home)');
    fireEvent.click(firstButton);
    
    expect(mockNavigateToMove).toHaveBeenCalledWith(0);
  });

  it('should call navigateToMove when clicking previous button', () => {
    useGameStore.mockReturnValue({
      moveHistory: [
        { san: 'e4', from: 'e2', to: 'e4' },
        { san: 'e5', from: 'e7', to: 'e5' },
      ],
      gameOver: true,
      navigateToMove: mockNavigateToMove,
      currentMoveIndex: 2,
    });

    render(<MoveNavigation />);
    
    const prevButton = screen.getByTitle('Previous move (←)');
    fireEvent.click(prevButton);
    
    expect(mockNavigateToMove).toHaveBeenCalledWith(1);
  });

  it('should call navigateToMove when clicking next button', () => {
    useGameStore.mockReturnValue({
      moveHistory: [
        { san: 'e4', from: 'e2', to: 'e4' },
        { san: 'e5', from: 'e7', to: 'e5' },
      ],
      gameOver: true,
      navigateToMove: mockNavigateToMove,
      currentMoveIndex: 0,
    });

    render(<MoveNavigation />);
    
    const nextButton = screen.getByTitle('Next move (→)');
    fireEvent.click(nextButton);
    
    expect(mockNavigateToMove).toHaveBeenCalledWith(1);
  });

  it('should call navigateToMove when clicking last button', () => {
    useGameStore.mockReturnValue({
      moveHistory: [
        { san: 'e4', from: 'e2', to: 'e4' },
        { san: 'e5', from: 'e7', to: 'e5' },
      ],
      gameOver: true,
      navigateToMove: mockNavigateToMove,
      currentMoveIndex: 0,
    });

    render(<MoveNavigation />);
    
    const lastButton = screen.getByTitle('Last move (End)');
    fireEvent.click(lastButton);
    
    expect(mockNavigateToMove).toHaveBeenCalledWith(2);
  });

  it('should disable first and previous buttons at start', () => {
    useGameStore.mockReturnValue({
      moveHistory: [
        { san: 'e4', from: 'e2', to: 'e4' },
        { san: 'e5', from: 'e7', to: 'e5' },
      ],
      gameOver: true,
      navigateToMove: mockNavigateToMove,
      currentMoveIndex: 0,
    });

    render(<MoveNavigation />);
    
    const firstButton = screen.getByTitle('First move (Home)');
    const prevButton = screen.getByTitle('Previous move (←)');
    
    expect(firstButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
  });

  it('should disable next and last buttons at end', () => {
    useGameStore.mockReturnValue({
      moveHistory: [
        { san: 'e4', from: 'e2', to: 'e4' },
        { san: 'e5', from: 'e7', to: 'e5' },
      ],
      gameOver: true,
      navigateToMove: mockNavigateToMove,
      currentMoveIndex: undefined, // At the end
    });

    render(<MoveNavigation />);
    
    const nextButton = screen.getByTitle('Next move (→)');
    const lastButton = screen.getByTitle('Last move (End)');
    
    expect(nextButton).toBeDisabled();
    expect(lastButton).toBeDisabled();
  });
});
