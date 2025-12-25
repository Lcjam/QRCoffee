/**
 * 공통 폼 검증 유틸리티 함수
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 이메일 형식 검증
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: '이메일은 필수입니다.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '올바른 이메일 형식을 입력해주세요.' };
  }

  return { isValid: true };
};

/**
 * 비밀번호 검증
 */
export const validatePassword = (password: string, minLength: number = 6): ValidationResult => {
  if (!password || !password.trim()) {
    return { isValid: false, error: '비밀번호는 필수입니다.' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `비밀번호는 최소 ${minLength}자 이상이어야 합니다.` };
  }

  return { isValid: true };
};

/**
 * 비밀번호 확인 검증
 */
export const validatePasswordConfirm = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: '비밀번호가 일치하지 않습니다.' };
  }

  return { isValid: true };
};

/**
 * 필수 필드 검증
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName}은(는) 필수입니다.` };
  }

  return { isValid: true };
};

/**
 * 회원가입 폼 검증
 */
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  name: string;
}

export const validateSignupForm = (formData: SignupFormData): ValidationResult => {
  // 이메일 검증
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  // 비밀번호 검증
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  // 비밀번호 확인 검증
  if (formData.confirmPassword !== undefined) {
    const confirmValidation = validatePasswordConfirm(formData.password, formData.confirmPassword);
    if (!confirmValidation.isValid) {
      return confirmValidation;
    }
  }

  // 이름 검증
  const nameValidation = validateRequired(formData.name, '이름');
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  return { isValid: true };
};
