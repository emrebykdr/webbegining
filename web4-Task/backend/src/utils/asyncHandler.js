/**
 * Async fonksiyonları try-catch ile saran yardımcı wrapper
 * Controller'lardaki tekrarlayan try-catch bloklarını kaldırır
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;
