export interface PasswordValidationResult {
  hasUpper: boolean;
  hasNumber: boolean;
  hasLength: boolean;
  hasSpecial: boolean;
  matches: boolean;
  valid: boolean;
}

export const validatePasswordReset = (
  password: string = '',
  confirm: string = ''
): PasswordValidationResult => {
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasLength = password.length >= 8;
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-\\\[\]/+=~`]/.test(password);
  const matches = password === confirm && confirm.length > 0;

  const valid = hasUpper && hasNumber && hasLength && hasSpecial && matches;

  return {
    hasUpper,
    hasNumber,
    hasLength,
    hasSpecial,
    matches,
    valid,
  };
};