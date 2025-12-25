package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.StoreRequest;
import com.qrcoffee.backend.dto.StoreResponse;
import com.qrcoffee.backend.entity.Store;
import com.qrcoffee.backend.exception.BusinessException;
import com.qrcoffee.backend.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StoreService {
    
    private final StoreRepository storeRepository;
    
    /**
     * 매장 ID로 조회
     */
    public StoreResponse getStoreById(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("매장을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        return convertToResponse(store);
    }
    
    /**
     * 활성 매장 목록 조회
     */
    public List<StoreResponse> getActiveStores() {
        List<Store> activeStores = storeRepository.findByIsActive(true);
        return activeStores.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 전체 매장 목록 조회
     */
    public List<StoreResponse> getAllStores() {
        List<Store> stores = storeRepository.findAll();
        return stores.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 매장 정보 수정
     */
    @Transactional
    public StoreResponse updateStore(Long storeId, StoreRequest request) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("매장을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 매장 정보 업데이트
        store.setName(request.getName());
        store.setAddress(request.getAddress());
        store.setPhone(request.getPhone());
        store.setBusinessHours(request.getBusinessHours());
        store.setIsActive(request.getIsActive());
        
        Store updatedStore = storeRepository.save(store);
        
        log.info("매장 정보 수정 완료: storeId={}, name={}", storeId, request.getName());
        
        return convertToResponse(updatedStore);
    }
    
    /**
     * 매장 생성 (시스템 관리자용)
     */
    @Transactional
    public StoreResponse createStore(StoreRequest request) {
        Store store = Store.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .businessHours(request.getBusinessHours())
                .isActive(request.getIsActive())
                .build();
        
        Store savedStore = storeRepository.save(store);
        
        log.info("새 매장 생성 완료: storeId={}, name={}", savedStore.getId(), savedStore.getName());
        
        return convertToResponse(savedStore);
    }
    
    /**
     * 매장 상태 변경 (활성/비활성)
     */
    @Transactional
    public StoreResponse toggleStoreStatus(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException("매장을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        store.setIsActive(!store.getIsActive());
        Store updatedStore = storeRepository.save(store);
        
        log.info("매장 상태 변경: storeId={}, isActive={}", storeId, updatedStore.getIsActive());
        
        return convertToResponse(updatedStore);
    }
    
    /**
     * Store 엔티티를 StoreResponse로 변환
     */
    private StoreResponse convertToResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .address(store.getAddress())
                .phone(store.getPhone())
                .businessHours(store.getBusinessHours())
                .isActive(store.getIsActive())
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .build();
    }
} 
