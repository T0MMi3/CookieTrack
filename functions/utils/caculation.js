const logExecutionTime = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => { // Fires when response is sent
        const duration = Date.now() - start;
        console.log(`[${req.method}] ${req.originalUrl} - ${duration}ms`);
    });

    next();
};

// Helper function to check for positive floats
const isPositiveFloat = (value) => {
    return typeof value === 'number' && value > 0 && Number.isFinite(value);
};

// Helper function to check for positive integers
const isPositiveInt = (value) => {
    return Number.isInteger(value) && value > 0;
};

module.exports = {
    logExecutionTime,
    isPositiveFloat,
    isPositiveInt
};