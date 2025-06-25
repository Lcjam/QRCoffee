package com.qrcoffee.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubAccountRequest {
    
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;
    
    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 6, message = "비밀번호는 최소 6자 이상이어야 합니다")
    private String password;
    
    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다")
    private String name;
    
    @Size(max = 20, message = "전화번호는 20자를 초과할 수 없습니다")
    private String phone;
    
    /**
     * SignupRequest로 변환
     */
    public SignupRequest toSignupRequest(Long storeId, Long parentUserId) {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail(this.email);
        signupRequest.setPassword(this.password);
        signupRequest.setName(this.name);
        signupRequest.setPhone(this.phone);
        signupRequest.setStoreId(storeId);
        signupRequest.setParentUserId(parentUserId);
        return signupRequest;
    }
} 