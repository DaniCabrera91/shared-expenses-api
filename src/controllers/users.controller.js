exports.getAllUsers = (req, res) => {
  res.json([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Laura García" },
  ]);
};
