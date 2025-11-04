// 手机对比工具 - 主要JavaScript文件

// 全局变量
let allPhones = [];
let filteredPhones = [];
let selectedPhones = [];
let userAddedPhones = [];

// DOM元素
const elements = {
    searchInput: document.getElementById('searchInput'),
    brandFilter: document.getElementById('brandFilter'),
    priceFilter: document.getElementById('priceFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    clearFilters: document.getElementById('clearFilters'),
    compareSelected: document.getElementById('compareSelected'),
    addPhoneBtn: document.getElementById('addPhoneBtn'),
    exportDataBtn: document.getElementById('exportDataBtn'),
    importDataBtn: document.getElementById('importDataBtn'),
    importFileInput: document.getElementById('importFileInput'),
    phoneList: document.getElementById('phoneList'),
    loading: document.getElementById('loading'),
    totalPhones: document.getElementById('totalPhones'),
    filteredPhones: document.getElementById('filteredPhones'),
    selectedPhones: document.getElementById('selectedPhones'),
    // 模态框
    addPhoneModal: document.getElementById('addPhoneModal'),
    compareModal: document.getElementById('compareModal'),
    editPhoneModal: document.getElementById('editPhoneModal'),
    closeAddModal: document.getElementById('closeAddModal'),
    closeCompareModal: document.getElementById('closeCompareModal'),
    closeEditModal: document.getElementById('closeEditModal'),
    addPhoneForm: document.getElementById('addPhoneForm'),
    editPhoneForm: document.getElementById('editPhoneForm'),
    cancelAddBtn: document.getElementById('cancelAddBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    toast: document.getElementById('toast')
};

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
async function initializeApp() {
    try {
        // 加载用户添加的手机数据
        loadUserAddedPhones();
        
        // 加载主数据文件
        await loadPhoneData();
        
        // 绑定事件监听器
        bindEventListeners();
        
        // 初始化显示
        displayPhones(allPhones);
        updateStats();
        
        // 隐藏加载状态
        elements.loading.style.display = 'none';
        
        showToast('数据加载完成！', 'success');
    } catch (error) {
        console.error('初始化应用失败:', error);
        showToast('数据加载失败，请刷新页面重试', 'error');
        elements.loading.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>数据加载失败</p>';
    }
}

// 加载手机数据
async function loadPhoneData() {
    try {
        const response = await fetch('./data/all_phones_unified.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allPhones = data.phones || [];
        
        // 合并用户添加的数据
        allPhones = [...allPhones, ...userAddedPhones];
        
        filteredPhones = [...allPhones];
        console.log(`加载了 ${allPhones.length} 款手机数据`);
    } catch (error) {
        console.error('加载手机数据失败:', error);
        throw error;
    }
}

// 加载用户添加的手机数据
function loadUserAddedPhones() {
    const stored = localStorage.getItem('userAddedPhones');
    if (stored) {
        try {
            userAddedPhones = JSON.parse(stored);
            console.log(`加载了 ${userAddedPhones.length} 款用户添加的手机`);
        } catch (error) {
            console.error('解析用户添加的手机数据失败:', error);
            userAddedPhones = [];
        }
    }
}

// 保存用户添加的手机数据
function saveUserAddedPhones() {
    localStorage.setItem('userAddedPhones', JSON.stringify(userAddedPhones));
}

// 绑定事件监听器
function bindEventListeners() {
    // 搜索功能
    elements.searchInput.addEventListener('input', function() {
        console.log('搜索输入:', this.value);
        debounce(applyFilters, 300)();
    });
    
    // 筛选器
    elements.brandFilter.addEventListener('change', applyFilters);
    elements.priceFilter.addEventListener('change', applyFilters);
    elements.categoryFilter.addEventListener('change', applyFilters);
    
    // 清除筛选
    elements.clearFilters.addEventListener('click', clearAllFilters);
    
    // 对比功能
    elements.compareSelected.addEventListener('click', showCompareModal);
    
    // 添加手机
    elements.addPhoneBtn.addEventListener('click', showAddPhoneModal);
    elements.addPhoneForm.addEventListener('submit', handleAddPhone);
    elements.cancelAddBtn.addEventListener('click', hideAddPhoneModal);
    
    // 编辑手机
    elements.editPhoneForm.addEventListener('submit', handleEditPhone);
    elements.cancelEditBtn.addEventListener('click', hideEditPhoneModal);
    
    // 模态框关闭
    elements.closeAddModal.addEventListener('click', hideAddPhoneModal);
    elements.closeCompareModal.addEventListener('click', hideCompareModal);
    elements.closeEditModal.addEventListener('click', hideEditPhoneModal);
    
    // 数据导入导出
    elements.exportDataBtn.addEventListener('click', exportData);
    elements.importDataBtn.addEventListener('click', () => elements.importFileInput.click());
    elements.importFileInput.addEventListener('change', handleImportData);
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === elements.addPhoneModal) {
            hideAddPhoneModal();
        }
        if (event.target === elements.compareModal) {
            hideCompareModal();
        }
        if (event.target === elements.editPhoneModal) {
            hideEditPhoneModal();
        }
    });
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 应用筛选器
function applyFilters() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    const brandFilter = elements.brandFilter.value;
    const priceFilter = elements.priceFilter.value;
    const categoryFilter = elements.categoryFilter.value;
    
    console.log('搜索词:', searchTerm);
    console.log('筛选条件:', { brandFilter, priceFilter, categoryFilter });
    
    filteredPhones = allPhones.filter(phone => {
        // 搜索筛选 - 增强版本，处理空值
        let matchesSearch = true;
        if (searchTerm) {
            const model = (phone.model || '').toLowerCase();
            const brand = (phone.brand || '').toLowerCase();
            const processorModel = (phone.processor?.model || '').toLowerCase();
            const series = (phone.series || '').toLowerCase();
            const category = (phone.category || '').toLowerCase();
            
            matchesSearch = model.includes(searchTerm) ||
                           brand.includes(searchTerm) ||
                           processorModel.includes(searchTerm) ||
                           series.includes(searchTerm) ||
                           category.includes(searchTerm);
        }
        
        // 品牌筛选
        const matchesBrand = !brandFilter || phone.brand === brandFilter;
        
        // 价位筛选
        const priceValue = getPriceValue(phone.price);
        const matchesPrice = !priceFilter || checkPriceRange(priceValue, priceFilter);
        
        // 类型筛选
        const matchesCategory = !categoryFilter || phone.category === categoryFilter;
        
        const result = matchesSearch && matchesBrand && matchesPrice && matchesCategory;
        
        // 调试信息
        if (searchTerm && phone.model.toLowerCase().includes(searchTerm)) {
            console.log(`匹配手机: ${phone.model}, 搜索: ${searchTerm}`);
        }
        
        return result;
    });
    
    console.log('筛选结果数量:', filteredPhones.length);
    displayPhones(filteredPhones);
    updateStats();
}

// 获取价格值（处理嵌套结构）
function getPriceValue(priceObj) {
    if (!priceObj) return 0;
    
    // 如果是嵌套结构
    if (priceObj.start_price && typeof priceObj.start_price === 'object') {
        // 如果有starting_price字段
        if (priceObj.start_price.starting_price) {
            const price = priceObj.start_price.starting_price;
            if (typeof price === 'number') {
                return price;
            }
            // 如果是字符串，尝试提取数字
            const numMatch = price.toString().match(/\d+/);
            return numMatch ? parseInt(numMatch[0]) : 0;
        }
        // 如果是其他对象结构，返回0
        return 0;
    }
    
    // 如果是直接数字
    if (typeof priceObj.start_price === 'number') {
        return priceObj.start_price;
    }
    
    return 0;
}

// 获取详细价格信息
function getDetailedPriceInfo(phone) {
    if (!phone.price || !phone.price.start_price) {
        return null;
    }
    
    const startPrice = phone.price.start_price;
    const priceVariants = [];
    
    // 如果是对象结构
    if (typeof startPrice === 'object') {
        
        // 1. 检查是否有storage_variants
        if (startPrice.storage_variants) {
            Object.entries(startPrice.storage_variants).forEach(([config, price]) => {
                // 格式化配置名称
                let formattedConfig = config;
                if (config.includes('+')) {
                    formattedConfig = config.replace(/(\d+)\+(\d+)/, '$1G+$2G');
                }
                priceVariants.push({
                    config: formattedConfig,
                    price: typeof price === 'string' ? price : `¥${price}`
                });
            });
        }
        
        // 2. 检查是否有直接的价格配置（如"12GB+256GB": "5699元"）
        Object.entries(startPrice).forEach(([key, value]) => {
            if (key !== 'starting_price' && key !== 'currency' && key !== 'storage_variants') {
                // 跳过已处理的字段
                if (key === 'starting_price' || key === 'currency') {
                    return;
                }
                
                // 检查是否是配置价格（如"12GB+256GB": "5699元"）
                if (typeof value === 'string' && (value.includes('元') || value.includes('¥'))) {
                    // 格式化配置名称
                    let formattedConfig = key;
                    if (key.includes('GB') || key.includes('+')) {
                        formattedConfig = key.replace(/(\d+)GB\+(\d+)/, '$1G+$2G').replace(/(\d+)\+(\d+)/, '$1G+$2G');
                    }
                    priceVariants.push({
                        config: formattedConfig,
                        price: value
                    });
                }
            }
        });
        
        // 3. 如果没有找到其他配置，但有starting_price，我们仍然返回这个基础价格
        if (priceVariants.length === 0 && startPrice.starting_price) {
            return null; // 让formatPriceDisplay处理基础价格
        }
        
        return priceVariants.length > 0 ? priceVariants : null;
    }
    
    return null;
}

// 格式化价格显示
function formatPriceDisplay(phone) {
    const basePrice = getPriceValue(phone.price);
    const detailedPrices = getDetailedPriceInfo(phone);
    
    let priceDisplay = '';
    
    if (detailedPrices && detailedPrices.length > 0) {
        // 显示详细价格配置
        const priceList = detailedPrices.map(variant => 
            `<div class="price-variant">${variant.config} ${variant.price}</div>`
        ).join('');
        
        // 如果有起售价，添加到顶部
        if (basePrice > 0) {
            priceDisplay += `<div class="price-base">起售价 ¥${basePrice.toLocaleString()}</div>`;
        }
        priceDisplay += priceList;
    } else if (basePrice > 0) {
        // 显示起售价
        priceDisplay = `起售价 ¥${basePrice.toLocaleString()}`;
    } else {
        priceDisplay = '价格未知';
    }
    
    return priceDisplay;
}

// 获取充电信息（处理嵌套结构）
function getChargingInfo(chargingObj) {
    if (!chargingObj) return '未知';
    
    // 如果是对象结构
    if (typeof chargingObj === 'object') {
        const wired = chargingObj.wired || '';
        const wireless = chargingObj.wireless || '';
        
        if (wired && wireless) {
            return `${wired} (有线) / ${wireless} (无线)`;
        } else if (wired) {
            return `${wired} (有线)`;
        } else if (wireless) {
            return `${wireless} (无线)`;
        }
    }
    
    // 如果是字符串
    if (typeof chargingObj === 'string') {
        return chargingObj;
    }
    
    return '未知';
}

// 获取存储信息（处理数组结构）
function getStorageInfo(storageObj) {
    if (!storageObj) return '未知';
    
    // 如果是数组
    if (Array.isArray(storageObj)) {
        return storageObj.join(', ');
    }
    
    // 如果是字符串
    if (typeof storageObj === 'string') {
        return storageObj;
    }
    
    return '未知';
}

// 获取后置摄像头信息（处理嵌套结构）
function getRearCameraInfo(cameraObj) {
    if (!cameraObj) return '未知';
    
    // 如果是对象结构
    if (typeof cameraObj === 'object' && !Array.isArray(cameraObj)) {
        const main = cameraObj.main || '';
        const ultra_wide = cameraObj.ultra_wide || '';
        const telephoto = cameraObj.telephoto || '';
        
        const parts = [];
        if (main) parts.push(main);
        if (ultra_wide) parts.push(ultra_wide);
        if (telephoto) parts.push(telephoto);
        
        return parts.length > 0 ? parts.join(', ') : '未知';
    }
    
    // 如果是字符串
    if (typeof cameraObj === 'string') {
        return cameraObj;
    }
    
    return '未知';
}

// 检查价格范围
function checkPriceRange(price, priceFilter) {
    if (!price || isNaN(price)) return false;
    
    switch (priceFilter) {
        case 'low':
            return price < 2000;
        case 'mid':
            return price >= 2000 && price <= 4000;
        case 'high':
            return price > 4000;
        default:
            return true;
    }
}

// 清除所有筛选器
function clearAllFilters() {
    elements.searchInput.value = '';
    elements.brandFilter.value = '';
    elements.priceFilter.value = '';
    elements.categoryFilter.value = '';
    
    filteredPhones = [...allPhones];
    displayPhones(filteredPhones);
    updateStats();
    
    showToast('已清除所有筛选条件', 'success');
}

// 显示手机列表
function displayPhones(phones) {
    if (phones.length === 0) {
        elements.phoneList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>没有找到匹配的手机</h3>
                <p>请尝试调整搜索条件或筛选器</p>
            </div>
        `;
        return;
    }
    
    const phoneCards = phones.map(phone => createPhoneCard(phone)).join('');
    elements.phoneList.innerHTML = phoneCards;
    
    // 绑定手机卡片事件
    bindPhoneCardEvents();
}

// 创建手机卡片
function createPhoneCard(phone) {
    const isSelected = selectedPhones.some(selected => selected.id === phone.id);
    const priceDisplay = formatPriceDisplay(phone);
    
    return `
        <div class="phone-card ${isSelected ? 'selected' : ''}" data-phone-id="${phone.id}">
            <input type="checkbox" class="select-checkbox" ${isSelected ? 'checked' : ''} 
                   onchange="togglePhoneSelection('${phone.id}')">
            
            <div class="phone-brand">${phone.brand}</div>
            <div class="phone-category">${phone.category}</div>
            
            <h3 class="phone-model">${phone.model}</h3>
            <p class="phone-series">${phone.series}</p>
            
            <div class="phone-specs">
                <div class="spec-item">
                    <i class="fas fa-microchip"></i>
                    <span>${phone.processor.model || '未知'}</span>
                </div>
                <div class="spec-item">
                    <i class="fas fa-memory"></i>
                    <span>${phone.memory.ram || '未知'}</span>
                </div>
                <div class="spec-item">
                    <i class="fas fa-mobile-alt"></i>
                    <span>${phone.display.size || '未知'}</span>
                </div>
                <div class="spec-item">
                    <i class="fas fa-camera"></i>
                    <span>${getRearCameraInfo(phone.camera.rear)}</span>
                </div>
            </div>
            
            <div class="phone-price">${priceDisplay}</div>
            
            ${phone.features && phone.features.length > 0 ? `
                <div class="phone-features">
                    <h4>特色功能</h4>
                    <div class="feature-tags">
                        ${phone.features.slice(0, 3).map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="phone-actions">
                <button class="btn btn-primary btn-small" onclick="viewPhoneDetails('${phone.id}')">
                    <i class="fas fa-eye"></i> 查看详情
                </button>
                <button class="btn btn-info btn-small" onclick="togglePhoneSelection('${phone.id}')">
                    <i class="fas ${isSelected ? 'fa-minus' : 'fa-plus'}"></i> 
                    ${isSelected ? '取消选择' : '加入对比'}
                </button>
                <button class="btn btn-warning btn-small" onclick="editPhone('${phone.id}')">
                    <i class="fas fa-edit"></i> 编辑
                </button>
            </div>
        </div>
    `;
}

// 绑定手机卡片事件
function bindPhoneCardEvents() {
    // 卡片点击事件
    document.querySelectorAll('.phone-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果点击的是按钮或复选框，不触发卡片选择
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
                return;
            }
            
            const phoneId = this.dataset.phoneId;
            togglePhoneSelection(phoneId);
        });
    });
}

// 切换手机选择状态
function togglePhoneSelection(phoneId) {
    const phone = allPhones.find(p => p.id === phoneId);
    if (!phone) return;
    
    const existingIndex = selectedPhones.findIndex(p => p.id === phoneId);
    
    if (existingIndex !== -1) {
        // 取消选择
        selectedPhones.splice(existingIndex, 1);
        showToast(`已从对比中移除 ${phone.model}`, 'success');
    } else {
        // 添加选择
        if (selectedPhones.length >= 6) {
            showToast('最多只能同时对比6款手机', 'error');
            return;
        }
        selectedPhones.push(phone);
        showToast(`已添加 ${phone.model} 到对比列表`, 'success');
    }
    
    // 更新UI
    updatePhoneSelectionUI();
    updateStats();
}

// 更新手机选择UI
function updatePhoneSelectionUI() {
    // 更新卡片选中状态
    document.querySelectorAll('.phone-card').forEach(card => {
        const phoneId = card.dataset.phoneId;
        const isSelected = selectedPhones.some(p => p.id === phoneId);
        
        card.classList.toggle('selected', isSelected);
        
        // 更新复选框状态
        const checkbox = card.querySelector('.select-checkbox');
        if (checkbox) {
            checkbox.checked = isSelected;
        }
        
        // 更新按钮文本
        const actionBtn = card.querySelector('.btn-info');
        if (actionBtn) {
            const icon = actionBtn.querySelector('i');
            const text = actionBtn.childNodes[actionBtn.childNodes.length - 1];
            
            if (isSelected) {
                icon.className = 'fas fa-minus';
                text.textContent = ' 取消选择';
            } else {
                icon.className = 'fas fa-plus';
                text.textContent = ' 加入对比';
            }
        }
    });
    
    // 更新对比按钮状态
    elements.compareSelected.disabled = selectedPhones.length === 0;
    elements.compareSelected.innerHTML = `<i class="fas fa-balance-scale"></i> 对比选中 (${selectedPhones.length}/6)`;
}

// 更新统计信息
function updateStats() {
    elements.totalPhones.textContent = allPhones.length;
    elements.filteredPhones.textContent = filteredPhones.length;
    elements.selectedPhones.textContent = selectedPhones.length;
}

// 显示添加手机模态框
function showAddPhoneModal() {
    elements.addPhoneModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 隐藏添加手机模态框
function hideAddPhoneModal() {
    elements.addPhoneModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    elements.addPhoneForm.reset();
}

// 处理添加手机表单提交
function handleAddPhone(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const phoneData = {
        id: `user_${Date.now()}`,
        brand: formData.get('brand'),
        model: formData.get('model'),
        series: formData.get('series'),
        category: formData.get('category') || '中端',
        processor: {
            brand: formData.get('processor_brand'),
            model: formData.get('processor_model'),
            process: '',
            gpu: ''
        },
        memory: {
            ram: formData.get('memory_ram'),
            storage: formData.get('memory_storage')
        },
        display: {
            size: formData.get('display_size'),
            resolution: formData.get('display_resolution'),
            refresh_rate: formData.get('display_refresh_rate'),
            type: ''
        },
        camera: {
            rear: formData.get('camera_rear'),
            front: formData.get('camera_front'),
            features: ''
        },
        battery: {
            capacity: formData.get('battery_capacity'),
            charging: formData.get('battery_charging')
        },
        price: {
            start_price: parseFloat(formData.get('price_start_price')) || 0,
            currency: 'CNY'
        },
        release_date: formData.get('release_date'),
        features: formData.get('features') ? formData.get('features').split(',').map(f => f.trim()) : [],
        description: formData.get('description')
    };
    
    // 验证必填字段
    if (!phoneData.brand || !phoneData.model) {
        showToast('请填写品牌和型号', 'error');
        return;
    }
    
    // 添加到用户数据
    userAddedPhones.push(phoneData);
    saveUserAddedPhones();
    
    // 添加到主数据
    allPhones.push(phoneData);
    filteredPhones.push(phoneData);
    
    // 更新显示
    displayPhones(filteredPhones);
    updateStats();
    
    // 关闭模态框
    hideAddPhoneModal();
    
    showToast(`已成功添加 ${phoneData.model}`, 'success');
}

// 显示对比模态框
function showCompareModal() {
    if (selectedPhones.length === 0) {
        showToast('请先选择要对比的手机', 'error');
        return;
    }
    
    const compareContent = createCompareTable(selectedPhones);
    document.getElementById('compareContent').innerHTML = compareContent;
    
    elements.compareModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 隐藏对比模态框
function hideCompareModal() {
    elements.compareModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 创建对比表格
function createCompareTable(phones) {
    if (phones.length === 0) {
        return '<p>没有选择要对比的手机</p>';
    }
    
    let table = `
        <div class="compare-header">
            <h3>正在对比 ${phones.length} 款手机</h3>
            <button class="btn btn-secondary btn-small" onclick="clearComparison()">
                <i class="fas fa-times"></i> 清除对比
            </button>
        </div>
        <div class="compare-table-container">
            <table class="compare-table">
                <thead>
                    <tr>
                        <th>参数</th>
                        ${phones.map(phone => `<th>${phone.brand} ${phone.model}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    // 基本信息
    table += `
        <tr>
            <td><strong>品牌</strong></td>
            ${phones.map(phone => `<td>${phone.brand}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>型号</strong></td>
            ${phones.map(phone => `<td>${phone.model}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>系列</strong></td>
            ${phones.map(phone => `<td>${phone.series}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>类型</strong></td>
            ${phones.map(phone => `<td>${phone.category}</td>`).join('')}
        </tr>
    `;
    
    // 处理器信息
    table += `
        <tr>
            <td><strong>处理器品牌</strong></td>
            ${phones.map(phone => `<td>${phone.processor.brand || '未知'}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>处理器型号</strong></td>
            ${phones.map(phone => `<td>${phone.processor.model || '未知'}</td>`).join('')}
        </tr>
    `;
    
    // 内存存储
    table += `
        <tr>
            <td><strong>内存</strong></td>
            ${phones.map(phone => `<td>${phone.memory.ram || '未知'}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>存储</strong></td>
            ${phones.map(phone => `<td>${getStorageInfo(phone.memory.storage)}</td>`).join('')}
        </tr>
    `;
    
    // 屏幕信息
    table += `
        <tr>
            <td><strong>屏幕尺寸</strong></td>
            ${phones.map(phone => `<td>${phone.display.size || '未知'}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>屏幕分辨率</strong></td>
            ${phones.map(phone => `<td>${phone.display.resolution || '未知'}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>刷新率</strong></td>
            ${phones.map(phone => `<td>${phone.display.refresh_rate || '未知'}</td>`).join('')}
        </tr>
    `;
    
    // 摄像头信息
    table += `
        <tr>
            <td><strong>后置摄像头</strong></td>
            ${phones.map(phone => `<td>${getRearCameraInfo(phone.camera.rear)}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>前置摄像头</strong></td>
            ${phones.map(phone => `<td>${phone.camera.front || '未知'}</td>`).join('')}
        </tr>
    `;
    
    // 电池信息
    table += `
        <tr>
            <td><strong>电池容量</strong></td>
            ${phones.map(phone => `<td>${phone.battery.capacity || '未知'}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>充电功率</strong></td>
            ${phones.map(phone => `<td>${getChargingInfo(phone.battery.charging)}</td>`).join('')}
        </tr>
    `;
    
    // 价格和发布时间
    table += `
        <tr>
            <td><strong>价格</strong></td>
            ${phones.map(phone => `<td>${formatPriceDisplay(phone)}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>发布时间</strong></td>
            ${phones.map(phone => `<td>${phone.release_date || '未知'}</td>`).join('')}
        </tr>
    `;
    
    // 特色功能
    if (phones.some(phone => phone.features && phone.features.length > 0)) {
        table += `
            <tr>
                <td><strong>特色功能</strong></td>
                ${phones.map(phone => `
                    <td>
                        ${phone.features && phone.features.length > 0 
                            ? phone.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('<br>')
                            : '无'
                        }
                    </td>
                `).join('')}
            </tr>
        `;
    }
    
    table += `
                </tbody>
            </table>
        </div>
    `;
    
    return table;
}

// 清除对比
function clearComparison() {
    selectedPhones = [];
    updatePhoneSelectionUI();
    updateStats();
    hideCompareModal();
    showToast('已清除所有对比选择', 'success');
}

// 查看手机详情
function viewPhoneDetails(phoneId) {
    const phone = allPhones.find(p => p.id === phoneId);
    if (!phone) return;
    
    const details = `
        <div class="phone-details">
            <h3>${phone.brand} ${phone.model}</h3>
            <div class="detail-section">
                <h4>基本信息</h4>
                <p><strong>品牌：</strong>${phone.brand}</p>
                <p><strong>型号：</strong>${phone.model}</p>
                <p><strong>系列：</strong>${phone.series}</p>
                <p><strong>类型：</strong>${phone.category}</p>
                <p><strong>发布时间：</strong>${phone.release_date || '未知'}</p>
            </div>
            
            <div class="detail-section">
                <h4>处理器</h4>
                <p><strong>品牌：</strong>${phone.processor.brand || '未知'}</p>
                <p><strong>型号：</strong>${phone.processor.model || '未知'}</p>
            </div>
            
            <div class="detail-section">
                <h4>内存存储</h4>
                <p><strong>内存：</strong>${phone.memory.ram || '未知'}</p>
                <p><strong>存储：</strong>${getStorageInfo(phone.memory.storage)}</p>
            </div>
            
            <div class="detail-section">
                <h4>屏幕</h4>
                <p><strong>尺寸：</strong>${phone.display.size || '未知'}</p>
                <p><strong>分辨率：</strong>${phone.display.resolution || '未知'}</p>
                <p><strong>刷新率：</strong>${phone.display.refresh_rate || '未知'}</p>
            </div>
            
            <div class="detail-section">
                <h4>摄像头</h4>
                <p><strong>后置：</strong>${getRearCameraInfo(phone.camera.rear)}</p>
                <p><strong>前置：</strong>${phone.camera.front || '未知'}</p>
            </div>
            
            <div class="detail-section">
                <h4>电池</h4>
                <p><strong>容量：</strong>${phone.battery.capacity || '未知'}</p>
                <p><strong>充电：</strong>${getChargingInfo(phone.battery.charging)}</p>
            </div>
            
            <div class="detail-section">
                <h4>价格</h4>
                <div class="price-detail">${formatPriceDisplay(phone)}</div>
            </div>
            
            ${phone.features && phone.features.length > 0 ? `
                <div class="detail-section">
                    <h4>特色功能</h4>
                    <div class="feature-tags">
                        ${phone.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${phone.purchase_links && Object.keys(phone.purchase_links).length > 0 ? `
                <div class="detail-section">
                    <h4>购买链接</h4>
                    <div class="purchase-links">
                        ${Object.entries(phone.purchase_links).map(([platform, url]) => 
                            `<a href="${url}" target="_blank" class="purchase-link">
                                <i class="fas fa-external-link-alt"></i> ${platform}
                            </a>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${phone.detail_images && phone.detail_images.length > 0 ? `
                <div class="detail-section">
                    <h4>产品图片</h4>
                    <div class="detail-images">
                        ${phone.detail_images.map((img, index) => 
                            `<img src="${img}" alt="${phone.model} 图片 ${index + 1}" class="detail-image" onclick="openImageModal('${img}', '${phone.model}')">`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${phone.description ? `
                <div class="detail-section">
                    <h4>描述</h4>
                    <p>${phone.description}</p>
                </div>
            ` : ''}
        </div>
    `;
    
    // 创建详情模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>手机详情</h2>
                <span class="close" onclick="this.closest('.modal').remove(); document.body.style.overflow = 'auto';">&times;</span>
            </div>
            <div class="modal-body">
                ${details}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 打开图片模态框
function openImageModal(imageSrc, phoneModel) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content image-modal">
            <div class="modal-header">
                <h2>${phoneModel} - 产品图片</h2>
                <span class="close" onclick="this.closest('.modal').remove(); document.body.style.overflow = 'auto';">&times;</span>
            </div>
            <div class="modal-body">
                <img src="${imageSrc}" alt="${phoneModel}" class="full-size-image">
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// 导出数据
function exportData() {
    const exportData = {
        metadata: {
            export_time: new Date().toISOString(),
            total_phones: allPhones.length,
            user_added: userAddedPhones.length
        },
        phones: allPhones,
        userAddedPhones: userAddedPhones
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `手机对比数据_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showToast('数据导出成功', 'success');
}

// 处理数据导入
function handleImportData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.phones && Array.isArray(importedData.phones)) {
                // 导入手机数据
                const newPhones = importedData.phones.filter(phone => 
                    !allPhones.some(existing => existing.id === phone.id)
                );
                
                allPhones.push(...newPhones);
                filteredPhones = [...allPhones];
                
                // 导入用户添加的手机
                if (importedData.userAddedPhones && Array.isArray(importedData.userAddedPhones)) {
                    const newUserPhones = importedData.userAddedPhones.filter(phone => 
                        !userAddedPhones.some(existing => existing.id === phone.id)
                    );
                    
                    userAddedPhones.push(...newUserPhones);
                    saveUserAddedPhones();
                }
                
                displayPhones(filteredPhones);
                updateStats();
                
                showToast(`成功导入 ${newPhones.length} 款手机数据`, 'success');
            } else {
                showToast('导入文件格式不正确', 'error');
            }
        } catch (error) {
            console.error('导入数据失败:', error);
            showToast('导入文件解析失败', 'error');
        }
    };
    
    reader.readAsText(file);
    
    // 清空文件输入
    event.target.value = '';
}

// 编辑手机
function editPhone(phoneId) {
    const phone = allPhones.find(p => p.id === phoneId);
    if (!phone) {
        showToast('未找到该手机型号', 'error');
        return;
    }
    
    showEditPhoneModal(phone);
}

// 显示编辑手机模态框
function showEditPhoneModal(phone) {
    const form = elements.editPhoneForm;
    
    // 填充表单数据
    form.brand.value = phone.brand || '';
    form.model.value = phone.model || '';
    form.series.value = phone.series || '';
    form.category.value = phone.category || '';
    
    // 处理器信息
    form.processor_brand.value = phone.processor?.brand || '';
    form.processor_model.value = phone.processor?.model || '';
    
    // 内存存储
    form.memory_ram.value = phone.memory?.ram || '';
    form.memory_storage.value = Array.isArray(phone.memory?.storage) 
        ? phone.memory.storage.join(',') 
        : (phone.memory?.storage || '');
    
    // 屏幕信息
    form.display_size.value = phone.display?.size || '';
    form.display_resolution.value = phone.display?.resolution || '';
    form.display_refresh_rate.value = phone.display?.refresh_rate || '';
    
    // 摄像头信息
    if (phone.camera?.rear && typeof phone.camera.rear === 'object') {
        form.camera_main.value = phone.camera.rear.main || '';
        form.camera_ultra_wide.value = phone.camera.rear.ultra_wide || '';
        form.camera_telephoto.value = phone.camera.rear.telephoto || '';
    }
    
    // 电池信息
    form.battery_capacity.value = phone.battery?.capacity || '';
    form.battery_wired.value = phone.battery?.charging?.wired || '';
    form.battery_wireless.value = phone.battery?.charging?.wireless || '';
    
    // 价格信息
    if (phone.price?.start_price) {
        if (typeof phone.price.start_price === 'object') {
            form.price_starting_price.value = phone.price.start_price.starting_price || '';
        } else {
            form.price_starting_price.value = phone.price.start_price || '';
        }
    }
    form.price_currency.value = phone.price?.currency || 'CNY';
    
    // 特色功能
    form.features.value = phone.features?.join('\n') || '';
    
    // 购买链接
    form.purchase_links.value = phone.purchase_links ? 
        Object.entries(phone.purchase_links).map(([platform, url]) => `${platform}:${url}`).join('\n') : '';
    
    // 详情图片
    form.detail_images.value = phone.detail_images ? phone.detail_images.join('\n') : '';
    
    // 存储当前编辑的手机ID
    form.dataset.editingPhoneId = phone.id;
    
    elements.editPhoneModal.style.display = 'block';
}

// 隐藏编辑手机模态框
function hideEditPhoneModal() {
    elements.editPhoneModal.style.display = 'none';
    elements.editPhoneForm.reset();
    delete elements.editPhoneForm.dataset.editingPhoneId;
}

// 处理编辑手机表单提交
function handleEditPhone(event) {
    event.preventDefault();
    
    const form = event.target;
    const phoneId = form.dataset.editingPhoneId;
    
    if (!phoneId) {
        showToast('编辑失败：未找到要编辑的手机', 'error');
        return;
    }
    
    // 查找要编辑的手机
    const phoneIndex = allPhones.findIndex(p => p.id === phoneId);
    if (phoneIndex === -1) {
        showToast('编辑失败：未找到该手机', 'error');
        return;
    }
    
    try {
        // 解析特色功能
        const features = form.features.value
            .split('\n')
            .map(f => f.trim())
            .filter(f => f.length > 0);
        
        // 解析存储配置
        const storageStr = form.memory_storage.value.trim();
        const storage = storageStr ? storageStr.split(',').map(s => s.trim()) : [];
        
        // 解析购买链接
        const purchaseLinks = {};
        if (form.purchase_links.value.trim()) {
            form.purchase_links.value.split('\n').forEach(line => {
                const [platform, url] = line.split(':').map(s => s.trim());
                if (platform && url) {
                    purchaseLinks[platform] = url;
                }
            });
        }
        
        // 解析详情图片
        const detailImages = form.detail_images.value
            .split('\n')
            .map(img => img.trim())
            .filter(img => img.length > 0);
        
        // 构建更新后的手机数据
        const updatedPhone = {
            ...allPhones[phoneIndex],
            brand: form.brand.value,
            model: form.model.value,
            series: form.series.value,
            category: form.category.value,
            processor: {
                brand: form.processor_brand.value,
                model: form.processor_model.value,
                process: allPhones[phoneIndex].processor?.process || '',
                gpu: allPhones[phoneIndex].processor?.gpu || ''
            },
            memory: {
                ram: form.memory_ram.value,
                storage: storage.length > 0 ? storage : form.memory_storage.value
            },
            display: {
                size: form.display_size.value,
                resolution: form.display_resolution.value,
                refresh_rate: form.display_refresh_rate.value,
                type: allPhones[phoneIndex].display?.type || ''
            },
            camera: {
                rear: {
                    main: form.camera_main.value,
                    ultra_wide: form.camera_ultra_wide.value,
                    telephoto: form.camera_telephoto.value,
                    special: allPhones[phoneIndex].camera?.rear?.special || ''
                },
                front: allPhones[phoneIndex].camera?.front || ''
            },
            battery: {
                capacity: form.battery_capacity.value,
                charging: {
                    wired: form.battery_wired.value,
                    wireless: form.battery_wireless.value
                }
            },
            price: {
                start_price: {
                    starting_price: parseInt(form.price_starting_price.value) || 0,
                    currency: form.price_currency.value
                },
                currency: form.price_currency.value
            },
            features: features,
            purchase_links: purchaseLinks,
            detail_images: detailImages,
            connectivity: allPhones[phoneIndex].connectivity || {},
            design: allPhones[phoneIndex].design || {},
            os: allPhones[phoneIndex].os || {}
        };
        
        // 更新数据
        allPhones[phoneIndex] = updatedPhone;
        
        // 如果是用户添加的手机，也更新localStorage中的数据
        const userPhoneIndex = userAddedPhones.findIndex(p => p.id === phoneId);
        if (userPhoneIndex !== -1) {
            userAddedPhones[userPhoneIndex] = updatedPhone;
            saveUserAddedPhones();
        }
        
        // 重新显示手机列表
        displayPhones(filteredPhones);
        updateStats();
        
        hideEditPhoneModal();
        showToast(`${updatedPhone.model} 编辑成功！`, 'success');
        
    } catch (error) {
        console.error('编辑手机失败:', error);
        showToast('编辑失败，请重试', 'error');
    }
}

// 显示提示消息
function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// 添加无结果样式
const style = document.createElement('style');
style.textContent = `
    .no-results {
        text-align: center;
        padding: 3rem;
        color: #666;
    }
    
    .no-results i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: #ccc;
    }
    
    .no-results h3 {
        margin-bottom: 0.5rem;
        color: #555;
    }
    
    .compare-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .compare-table-container {
        overflow-x: auto;
        max-height: 70vh;
        overflow-y: auto;
    }
    
    .phone-details {
        max-height: 70vh;
        overflow-y: auto;
    }
    
    .detail-section {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .detail-section h4 {
        margin-bottom: 0.8rem;
        color: #667eea;
        border-bottom: 2px solid #667eea;
        padding-bottom: 0.3rem;
    }
    
    .detail-section p {
        margin-bottom: 0.5rem;
    }
    
    .price-variant {
        margin: 0.3rem 0;
        padding: 0.2rem 0;
        font-size: 0.9rem;
        color: #2c5aa0;
        font-weight: 500;
    }
    
    .phone-price .price-variant {
        font-size: 0.85rem;
        line-height: 1.2;
    }
    
    .price-base {
        font-weight: 600;
        color: #e74c3c;
        margin-bottom: 0.5rem;
        padding: 0.2rem 0;
        font-size: 0.95rem;
    }
    
    .phone-price .price-base {
        font-size: 0.9rem;
        margin-bottom: 0.3rem;
    }
    
    .price-detail {
        line-height: 1.4;
    }
    
    .price-detail .price-variant {
        margin: 0.5rem 0;
        padding: 0.3rem 0.5rem;
        background: #e3f2fd;
        border-radius: 4px;
        font-size: 0.95rem;
    }
    
    .purchase-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .purchase-link {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.5rem 1rem;
        background: #28a745;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-size: 0.9rem;
        transition: background-color 0.3s;
    }
    
    .purchase-link:hover {
        background: #218838;
        color: white;
    }
    
    .detail-images {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .detail-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.3s;
        border: 2px solid #e9ecef;
    }
    
    .detail-image:hover {
        transform: scale(1.05);
        border-color: #667eea;
    }
    
    .image-modal .modal-content {
        max-width: 90vw;
        max-height: 90vh;
        padding: 0;
    }
    
    .image-modal .modal-body {
        padding: 0;
        text-align: center;
    }
    
    .full-size-image {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
    }
`;
document.head.appendChild(style);