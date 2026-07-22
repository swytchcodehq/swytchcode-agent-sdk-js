"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwytchcodeError = void 0;
exports.isSwytchcodeError = isSwytchcodeError;
/**
 * Thrown when `exec()` fails: spawn error, non-zero exit, signal, or invalid JSON output.
 */
class SwytchcodeError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.name = "SwytchcodeError";
        this.cause = cause;
        Object.setPrototypeOf(this, SwytchcodeError.prototype);
    }
}
exports.SwytchcodeError = SwytchcodeError;
/**
 * Type guard for SwytchcodeError.
 */
function isSwytchcodeError(e) {
    return e instanceof SwytchcodeError;
}
