import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CapturedPieces from './CapturedPieces';
import useGameStore from '../../store/gameStore';

describe('CapturedPieces', () => {
  beforeEach(() => {
    // Reset the store before each test
    useGameStore.setState({
      capturedPieces: { white: [], black: [] },
      playerColor: 'white',
    });
  });

  it('should render the component with no captured pieces', () => {
    render(<CapturedPieces />);
    
    expect(screen.getByText('Captured Pieces')).toBeInTheDocument();
    expect(screen.getByText('Captured by White:')).toBeInTheDocument();
    expect(screen.getByText('Captured by Black:')).toBeInTheDocument();
    expect(screen.getAllByText('None')).toHaveLength(2);
  });

  it('should display captured pieces for white', () => {
    useGameStore.setState({
      capturedPieces: {
        white: ['p', 'n'],  // White captured a pawn and knight
        black: [],
      },
      playerColor: 'white',
    });

    const { container } = render(<CapturedPieces />);
    
    // Check that images are rendered for captured pieces
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    
    // Verify the alt texts include the captured pieces
    const altTexts = Array.from(images).map(img => img.alt);
    expect(altTexts).toContain('black p');
    expect(altTexts).toContain('black n');
  });

  it('should display captured pieces for black', () => {
    useGameStore.setState({
      capturedPieces: {
        white: [],
        black: ['p', 'b', 'r'],  // Black captured pawn, bishop, rook
      },
      playerColor: 'black',
    });

    const { container } = render(<CapturedPieces />);
    
    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
    
    const altTexts = Array.from(images).map(img => img.alt);
    expect(altTexts).toContain('white p');
    expect(altTexts).toContain('white b');
    expect(altTexts).toContain('white r');
  });

  it('should display captured pieces for both sides', () => {
    useGameStore.setState({
      capturedPieces: {
        white: ['p', 'n'],
        black: ['p', 'b'],
      },
      playerColor: 'white',
    });

    const { container } = render(<CapturedPieces />);
    
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(4);  // 2 for white, 2 for black
  });

  it('should display material advantage when white is ahead', () => {
    useGameStore.setState({
      capturedPieces: {
        white: ['q'],  // White captured queen (9 points)
        black: ['p'],  // Black captured pawn (1 point)
      },
      playerColor: 'white',
    });

    const { container } = render(<CapturedPieces />);
    
    // White should have +8 advantage
    expect(container.textContent).toContain('+8');
    expect(container.textContent).toContain('⚪');
  });

  it('should display material advantage when black is ahead', () => {
    useGameStore.setState({
      capturedPieces: {
        white: ['p'],  // White captured pawn (1 point)
        black: ['r'],  // Black captured rook (5 points)
      },
      playerColor: 'white',
    });

    const { container } = render(<CapturedPieces />);
    
    // Black should have +4 advantage
    expect(container.textContent).toContain('+4');
    expect(container.textContent).toContain('⚫');
  });

  it('should not display material advantage when even', () => {
    useGameStore.setState({
      capturedPieces: {
        white: ['p'],  // Both captured pawns
        black: ['p'],
      },
      playerColor: 'white',
    });

    const { container } = render(<CapturedPieces />);
    
    // Should not show any advantage indicator
    expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
  });

  it('should handle multiple pieces of the same type', () => {
    useGameStore.setState({
      capturedPieces: {
        white: ['p', 'p', 'p'],  // Three pawns
        black: [],
      },
      playerColor: 'white',
    });

    const { container } = render(<CapturedPieces />);
    
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(3);
  });

  it('should render piece images with correct styling', () => {
    useGameStore.setState({
      capturedPieces: {
        white: ['p'],
        black: [],
      },
      playerColor: 'white',
    });

    const { container } = render(<CapturedPieces />);
    
    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image.className).toContain('w-6');
    expect(image.className).toContain('h-6');
  });
});
