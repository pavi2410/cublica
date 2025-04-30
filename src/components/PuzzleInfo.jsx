function PuzzleInfo({ title, description }) {
  return (
    <div className="puzzle-info">
      <h1>Replicube Clone</h1>
      <h2>{title}</h2>
      <p>{description}</p>
      <p>Use the <code>setVoxel(x, y, z)</code> function to place blocks in the 3D space.</p>
    </div>
  );
}

export default PuzzleInfo;
