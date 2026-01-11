function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.message === 'Invalid input') {
    return res.status(400).json({
      success: false,
      message: 'Invalid input provided'
    });
  }

  if (err.message.includes('Duplicate entry')) {
    return res.status(409).json({
      success: false,
      message: 'Email already exists'
    });
  }

  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    success: false,
    message: isDev ? err.message : 'Server error',
    ...(isDev && { stack: err.stack })
  });
}

module.exports = { errorHandler };
