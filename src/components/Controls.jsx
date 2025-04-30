function Controls({ onRun, onReset, onPuzzleChange, puzzles, currentPuzzle }) {
  const handlePuzzleChange = (e) => {
    onPuzzleChange(e.target.value);
  };

  return (
    <div className="controls">
      <select 
        value={currentPuzzle} 
        onChange={handlePuzzleChange}
      >
        {puzzles.map((puzzle) => (
          <option key={puzzle.id} value={puzzle.id}>
            {puzzle.title}
          </option>
        ))}
      </select>
      <button onClick={onReset}>Reset</button>
      <button onClick={onRun}>Run Code</button>
    </div>
  );
}

export default Controls;
