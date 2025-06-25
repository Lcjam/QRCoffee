package com.qrcoffee.backend.service;

import com.qrcoffee.backend.dto.MenuRequest;
import com.qrcoffee.backend.dto.MenuResponse;
import com.qrcoffee.backend.entity.Category;
import com.qrcoffee.backend.entity.Menu;
import com.qrcoffee.backend.exception.BusinessException;
import com.qrcoffee.backend.repository.CategoryRepository;
import com.qrcoffee.backend.repository.MenuRepository;
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
public class MenuService {
    
    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    
    /**
     * 매장별 활성 메뉴 목록 조회
     */
    public List<MenuResponse> getActiveMenus(Long storeId) {
        List<Menu> menus = menuRepository.findByStoreIdAndIsAvailableOrderByCategoryIdAscDisplayOrderAsc(storeId, true);
        return menus.stream()
                .map(MenuResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 매장별 모든 메뉴 목록 조회 (관리자용)
     */
    public List<MenuResponse> getAllMenus(Long storeId) {
        List<Menu> menus = menuRepository.findByStoreIdOrderByCategoryIdAscDisplayOrderAsc(storeId);
        return menus.stream()
                .map(MenuResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 카테고리별 메뉴 목록 조회
     */
    public List<MenuResponse> getMenusByCategory(Long categoryId) {
        List<Menu> menus = menuRepository.findByCategoryIdAndIsAvailableOrderByDisplayOrderAsc(categoryId, true);
        return menus.stream()
                .map(MenuResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 고객용 메뉴 목록 조회 (활성 메뉴만)
     */
    public List<MenuResponse> getMenusForCustomer(Long storeId) {
        List<Menu> menus = menuRepository.findActiveMenusForCustomer(storeId);
        return menus.stream()
                .map(MenuResponse::from)
                .collect(Collectors.toList());
    }
    
    /**
     * 메뉴 ID로 조회
     */
    public MenuResponse getMenuById(Long menuId, Long storeId) {
        Menu menu = menuRepository.findByIdAndStoreId(menuId, storeId)
                .orElseThrow(() -> new BusinessException("메뉴를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        return MenuResponse.from(menu);
    }
    
    /**
     * 메뉴 생성
     */
    @Transactional
    public MenuResponse createMenu(Long storeId, MenuRequest request) {
        // 카테고리 존재 및 매장 일치 검증
        Category category = categoryRepository.findByIdAndStoreId(request.getCategoryId(), storeId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 카테고리입니다.", HttpStatus.BAD_REQUEST));
        
        // 메뉴명 중복 검사
        if (menuRepository.existsByStoreIdAndName(storeId, request.getName())) {
            throw new BusinessException("이미 존재하는 메뉴명입니다.", HttpStatus.BAD_REQUEST);
        }
        
        Menu menu = Menu.builder()
                .storeId(storeId)
                .categoryId(request.getCategoryId())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .isAvailable(request.getIsAvailable())
                .displayOrder(request.getDisplayOrder())
                .build();
        
        Menu savedMenu = menuRepository.save(menu);
        
        log.info("메뉴 생성 완료: storeId={}, menuId={}, name={}", 
                storeId, savedMenu.getId(), savedMenu.getName());
        
        return MenuResponse.from(savedMenu);
    }
    
    /**
     * 메뉴 수정
     */
    @Transactional
    public MenuResponse updateMenu(Long menuId, Long storeId, MenuRequest request) {
        Menu menu = menuRepository.findByIdAndStoreId(menuId, storeId)
                .orElseThrow(() -> new BusinessException("메뉴를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        // 카테고리 존재 및 매장 일치 검증
        Category category = categoryRepository.findByIdAndStoreId(request.getCategoryId(), storeId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 카테고리입니다.", HttpStatus.BAD_REQUEST));
        
        // 메뉴명 중복 검사 (자기 자신 제외)
        if (menuRepository.existsByStoreIdAndNameAndIdNot(storeId, request.getName(), menuId)) {
            throw new BusinessException("이미 존재하는 메뉴명입니다.", HttpStatus.BAD_REQUEST);
        }
        
        menu.setCategoryId(request.getCategoryId());
        menu.setName(request.getName());
        menu.setDescription(request.getDescription());
        menu.setPrice(request.getPrice());
        menu.setImageUrl(request.getImageUrl());
        menu.setIsAvailable(request.getIsAvailable());
        menu.setDisplayOrder(request.getDisplayOrder());
        
        Menu updatedMenu = menuRepository.save(menu);
        
        log.info("메뉴 수정 완료: menuId={}, name={}", menuId, request.getName());
        
        return MenuResponse.from(updatedMenu);
    }
    
    /**
     * 메뉴 삭제
     */
    @Transactional
    public void deleteMenu(Long menuId, Long storeId) {
        Menu menu = menuRepository.findByIdAndStoreId(menuId, storeId)
                .orElseThrow(() -> new BusinessException("메뉴를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        menuRepository.delete(menu);
        
        log.info("메뉴 삭제 완료: menuId={}, name={}", menuId, menu.getName());
    }
    
    /**
     * 메뉴 상태 변경 (판매중/품절)
     */
    @Transactional
    public MenuResponse toggleMenuAvailability(Long menuId, Long storeId) {
        Menu menu = menuRepository.findByIdAndStoreId(menuId, storeId)
                .orElseThrow(() -> new BusinessException("메뉴를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        
        menu.setIsAvailable(!menu.getIsAvailable());
        Menu updatedMenu = menuRepository.save(menu);
        
        log.info("메뉴 상태 변경: menuId={}, isAvailable={}", menuId, updatedMenu.getIsAvailable());
        
        return MenuResponse.from(updatedMenu);
    }
} 